package vn.edu.fpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.edu.fpt.dto.request.CreateWorkspaceRequest;
import vn.edu.fpt.dto.response.AcceptInviteResponse;
import vn.edu.fpt.dto.response.MemberResponse;
import vn.edu.fpt.dto.response.WorkspaceResponse;
import vn.edu.fpt.entity.*;
import vn.edu.fpt.repository.UserRepository;
import vn.edu.fpt.repository.WorkspaceInvitationRepository;
import vn.edu.fpt.repository.WorkspaceMemberRepository;
import vn.edu.fpt.repository.WorkspaceRepository;
import vn.edu.fpt.security.SecurityUtil;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final WorkspaceInvitationRepository invitationRepository;
    private final UserRepository userRepository;
    private final SecurityUtil securityUtil;
    private final EmailService emailService;

    @Transactional
    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request) {
        User currentUser = securityUtil.getCurrentUser();

        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .description(request.getDescription())
                .owner(currentUser)
                .build();
        workspace = workspaceRepository.save(workspace);

        WorkspaceMember membership = WorkspaceMember.builder()
                .workspace(workspace)
                .user(currentUser)
                .role(Role.ADMIN)
                .build();
        memberRepository.save(membership);

        return toWorkspaceResponse(workspace);
    }

    public WorkspaceResponse getWorkspace(Long workspaceId) {
        Workspace workspace = findWorkspaceOrThrow(workspaceId);
        checkMembership(workspaceId);
        return toWorkspaceResponse(workspace);
    }

    public List<WorkspaceResponse> getMyWorkspaces() {
        Long currentUserId = securityUtil.getCurrentUserId();
        List<WorkspaceMember> memberships = memberRepository.findByUserId(currentUserId);
        return memberships.stream()
                .map(m -> toWorkspaceResponse(m.getWorkspace()))
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkspaceResponse updateWorkspace(Long workspaceId, CreateWorkspaceRequest request) {
        Workspace workspace = findWorkspaceOrThrow(workspaceId);
        checkAdminOrThrow(workspaceId);

        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace = workspaceRepository.save(workspace);

        return toWorkspaceResponse(workspace);
    }

    @Transactional
    public void deleteWorkspace(Long workspaceId) {
        Workspace workspace = findWorkspaceOrThrow(workspaceId);
        checkAdminOrThrow(workspaceId);
        workspaceRepository.delete(workspace);
    }

    public void checkMembership(Long workspaceId) {
        Long userId = securityUtil.getCurrentUserId();
        if (!memberRepository.existsByWorkspaceIdAndUserId(workspaceId, userId)) {
            throw new RuntimeException("You are not a member of this workspace");
        }
    }

    public void checkMembership(Long workspaceId, Principal principal) {
        User currentUser = securityUtil.getCurrentUser(principal);
        if (!memberRepository.existsByWorkspaceIdAndUserId(workspaceId, currentUser.getId())) {
            throw new RuntimeException("You are not a member of this workspace");
        }
    }

    public void checkAdminOrThrow(Long workspaceId) {
        Long userId = securityUtil.getCurrentUserId();
        WorkspaceMember member = memberRepository.findByWorkspaceIdAndUserId(workspaceId, userId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this workspace"));
        if (member.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only workspace admins can perform this action");
        }
    }

    @Transactional
    public void inviteMember(Long workspaceId, String email, Principal principal) {
        Workspace workspace = findWorkspaceOrThrow(workspaceId);
        checkAdminOrThrow(workspaceId);

        User currentUser = securityUtil.getCurrentUser(principal);

        if (memberRepository.existsByWorkspaceIdAndUserId(workspaceId,
                userRepository.findByEmail(email).map(User::getId).orElse(-1L))) {
            throw new RuntimeException("User is already a member of this workspace");
        }

        String token = UUID.randomUUID().toString();
        Optional<WorkspaceInvitation> existing =
                invitationRepository.findByWorkspaceIdAndEmailAndStatus(
                        workspaceId, email, InvitationStatus.PENDING);
        if (existing.isPresent()) {
            WorkspaceInvitation inv = existing.get();
            inv.setToken(token);
            inv.setExpiryDate(LocalDateTime.now().plusHours(24));
            invitationRepository.save(inv);
        } else {
            WorkspaceInvitation invitation = WorkspaceInvitation.builder()
                    .workspace(workspace)
                    .email(email)
                    .token(token)
                    .expiryDate(LocalDateTime.now().plusHours(24))
                    .status(InvitationStatus.PENDING)
                    .build();
            invitationRepository.save(invitation);
        }

        emailService.sendInvitationEmail(email, workspace.getName(), currentUser.getFullName(), token);
    }

    @Transactional
    public AcceptInviteResponse acceptInvite(String token, Principal principal) {
        WorkspaceInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired invitation token"));

        if (invitation.getStatus() == InvitationStatus.ACCEPTED) {
            return AcceptInviteResponse.builder()
                    .message("Already accepted")
                    .workspaceName(invitation.getWorkspace().getName())
                    .workspaceId(invitation.getWorkspace().getId())
                    .build();
        }

        if (invitation.getExpiryDate().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            invitationRepository.save(invitation);
            throw new RuntimeException("Invitation has expired");
        }

        User invitedUser = userRepository.findByEmail(invitation.getEmail())
                .orElseThrow(() -> new RuntimeException(
                        "No account found for " + invitation.getEmail() + ". Please register first."));

        if (memberRepository.existsByWorkspaceIdAndUserId(
                invitation.getWorkspace().getId(), invitedUser.getId())) {
            invitation.setStatus(InvitationStatus.ACCEPTED);
            invitationRepository.save(invitation);
            return AcceptInviteResponse.builder()
                    .message("You are already a member of this workspace")
                    .workspaceName(invitation.getWorkspace().getName())
                    .workspaceId(invitation.getWorkspace().getId())
                    .build();
        }

        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(invitation.getWorkspace())
                .user(invitedUser)
                .role(Role.MEMBER)
                .build();
        memberRepository.save(member);

        invitation.setStatus(InvitationStatus.ACCEPTED);
        invitationRepository.save(invitation);

        return AcceptInviteResponse.builder()
                .message("Successfully joined the workspace!")
                .workspaceName(invitation.getWorkspace().getName())
                .workspaceId(invitation.getWorkspace().getId())
                .build();
    }

    public List<MemberResponse> getWorkspaceMembers(Long workspaceId) {
        checkMembership(workspaceId);
        return memberRepository.findByWorkspaceId(workspaceId)
                .stream()
                .map(m -> MemberResponse.builder()
                        .userId(m.getUser().getId())
                        .fullName(m.getUser().getFullName())
                        .email(m.getUser().getEmail())
                        .role(m.getRole().name())
                        .build())
                .collect(Collectors.toList());
    }

    private Workspace findWorkspaceOrThrow(Long workspaceId) {
        return workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
    }

    private WorkspaceResponse toWorkspaceResponse(Workspace workspace) {
        return WorkspaceResponse.builder()
                .id(workspace.getId())
                .name(workspace.getName())
                .description(workspace.getDescription())
                .ownerId(workspace.getOwner().getId())
                .ownerName(workspace.getOwner().getFullName())
                .memberCount(memberRepository.countByWorkspaceId(workspace.getId()))
                .createdAt(workspace.getCreatedAt())
                .build();
    }
}
