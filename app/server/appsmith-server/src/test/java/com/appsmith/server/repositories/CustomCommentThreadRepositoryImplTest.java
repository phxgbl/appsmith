package com.appsmith.server.repositories;

import com.appsmith.external.models.Policy;
import com.appsmith.server.acl.AclPermission;
import com.appsmith.server.domains.CommentThread;
import com.appsmith.server.domains.User;
import com.appsmith.server.dtos.CommentThreadFilterDTO;
import com.appsmith.server.helpers.PolicyUtils;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.junit4.SpringRunner;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@SpringBootTest
public class CustomCommentThreadRepositoryImplTest {

    @Autowired
    CommentThreadRepository commentThreadRepository;

    @Autowired
    PolicyUtils policyUtils;

    private CommentThread createThreadWithPolicies(String userEmail) {
        CommentThread thread = new CommentThread();
        User user = new User();
        user.setEmail(userEmail);

        Map<String, Policy> policyMap = policyUtils.generatePolicyFromPermission(Set.of(AclPermission.READ_THREAD), user);
        thread.setPolicies(Set.copyOf(policyMap.values()));
        return thread;
    }

    @Test
    @WithUserDetails(value = "api_user")
    public void addToSubscribers_WhenNoSubscriber_NewOnesAdded() {
        CommentThread thread = createThreadWithPolicies("api_user");

        Mono<CommentThread> commentThreadMono = commentThreadRepository.save(thread).flatMap(savedThread ->
                commentThreadRepository.addToSubscribers(savedThread.getId(), Set.of("a", "b", "c"))
                        .thenReturn(savedThread)
        ).flatMap(commentThread -> commentThreadRepository.findById(commentThread.getId()));

        StepVerifier.create(commentThreadMono).assertNext(commentThread -> {
            assertThat(commentThread.getSubscribers().size()).isEqualTo(3);
            assertThat(commentThread.getSubscribers()).contains("a", "b", "c");
        }).verifyComplete();
    }

    @Test
    @WithUserDetails(value = "api_user")
    public void addToSubscribers_WhenSubscriberExists_NewOnesAdded() {
        CommentThread thread = createThreadWithPolicies("api_user");

        Mono<CommentThread> commentThreadMono = commentThreadRepository.save(thread).flatMap(savedThread ->
                commentThreadRepository.addToSubscribers(savedThread.getId(), Set.of("a", "b", "c", "d"))
                        .thenReturn(savedThread)
        ).flatMap(commentThread -> commentThreadRepository.findById(commentThread.getId()));

        StepVerifier.create(commentThreadMono).assertNext(commentThread -> {
            assertThat(commentThread.getSubscribers().size()).isEqualTo(4);
            assertThat(commentThread.getSubscribers()).contains("a", "b", "c", "d");
        }).verifyComplete();
    }

    @Test
    @WithUserDetails(value = "api_user")
    public void findPrivateThread_WhenNoneExists_ReturnsEmpty() {
        CommentThread thread = createThreadWithPolicies("api_user");
        thread.setApplicationId("sample-application-id-1");
        thread.setIsPrivate(true);

        Mono<CommentThread> privateThreadMono = commentThreadRepository.save(thread)
                .then(commentThreadRepository.findPrivateThread("sample-application-id-2"));

        StepVerifier.create(privateThreadMono).verifyComplete();
    }

    @Test
    @WithUserDetails(value = "api_user")
    public void findPrivateThread_WhenOneExists_ReturnsOne() {
        CommentThread thread1 = createThreadWithPolicies("api_user");
        thread1.setApplicationId("sample-application-id-1");
        thread1.setAuthorUsername("author1");
        thread1.setIsPrivate(false);

        CommentThread thread2 = createThreadWithPolicies("api_user2");
        thread2.setApplicationId("sample-application-id-1");
        thread2.setAuthorUsername("author2");
        thread2.setIsPrivate(true);

        CommentThread thread3 = createThreadWithPolicies("api_user");
        thread3.setApplicationId("sample-application-id-1");
        thread3.setAuthorUsername("author3");
        thread3.setIsPrivate(true);

        Mono<CommentThread> privateThreadMono = commentThreadRepository.saveAll(List.of(thread1, thread2, thread3))
                .then(commentThreadRepository.findPrivateThread("sample-application-id-1"));

        StepVerifier.create(privateThreadMono).assertNext(commentThread -> {
            assertThat(commentThread.getAuthorUsername()).isEqualTo("author3");
        }).verifyComplete();
    }

    @Test
    @WithUserDetails(value = "api_user")
    public void findThread_WhenFilterExists_ReturnsFilteredResults() {
        CommentThread.CommentThreadState resolvedState = new CommentThread.CommentThreadState();
        resolvedState.setActive(true);

        CommentThread.CommentThreadState unresolvedState = new CommentThread.CommentThreadState();
        unresolvedState.setActive(false);

        CommentThread app1ResolvedThread = createThreadWithPolicies("api_user");
        app1ResolvedThread.setApplicationId("sample-application-id-1");
        app1ResolvedThread.setAuthorUsername("app1ResolvedThread");
        app1ResolvedThread.setResolvedState(resolvedState);

        CommentThread app1UnResolvedThread = createThreadWithPolicies("api_user");
        app1UnResolvedThread.setApplicationId("sample-application-id-1");
        app1UnResolvedThread.setAuthorUsername("app1UnResolvedThread");
        app1UnResolvedThread.setResolvedState(unresolvedState);

        CommentThread app2UnResolvedThread = createThreadWithPolicies("api_user");
        app2UnResolvedThread.setApplicationId("sample-application-id-2");
        app2UnResolvedThread.setAuthorUsername("app2UnResolvedThread");
        app2UnResolvedThread.setResolvedState(unresolvedState);

        List<CommentThread> threadList = List.of(app1ResolvedThread, app1UnResolvedThread, app2UnResolvedThread);

        Mono<List<CommentThread>> listMono = commentThreadRepository
                .saveAll(threadList)
                .collectList()
                .flatMap(commentThreads -> {
                    CommentThreadFilterDTO filterDTO = new CommentThreadFilterDTO();
                    filterDTO.setApplicationId("sample-application-id-1");
                    filterDTO.setResolved(false);
                    return commentThreadRepository.find(filterDTO, AclPermission.READ_THREAD).collectList();
                });

        StepVerifier.create(listMono).assertNext(
                commentThreads -> {
                    assertThat(commentThreads.size()).isEqualTo(1);
                    assertThat(commentThreads.get(0).getAuthorUsername()).isEqualTo("app1UnResolvedThread");
                }
        ).verifyComplete();
    }
}
