package vn.edu.fpt.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.request.AcceptInviteRequest;
import vn.edu.fpt.dto.request.CreateWorkspaceRequest;
import vn.edu.fpt.dto.request.InviteMemberRequest;
import vn.edu.fpt.dto.response.AcceptInviteResponse;
import vn.edu.fpt.dto.response.MemberResponse;
import vn.edu.fpt.dto.response.WorkspaceResponse;
import vn.edu.fpt.service.WorkspaceService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(@Valid @RequestBody CreateWorkspaceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workspaceService.createWorkspace(request));
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getMyWorkspaces() {
        return ResponseEntity.ok(workspaceService.getMyWorkspaces());
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(workspaceService.getWorkspace(workspaceId));
    }

    @PutMapping("/{workspaceId}")
    public ResponseEntity<WorkspaceResponse> updateWorkspace(
            @PathVariable Long workspaceId,
            @Valid @RequestBody CreateWorkspaceRequest request) {
        return ResponseEntity.ok(workspaceService.updateWorkspace(workspaceId, request));
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<Void> deleteWorkspace(@PathVariable Long workspaceId) {
        workspaceService.deleteWorkspace(workspaceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{workspaceId}/members")
    public ResponseEntity<List<MemberResponse>> getWorkspaceMembers(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(workspaceService.getWorkspaceMembers(workspaceId));
    }

    @PostMapping("/{workspaceId}/invite")
    public ResponseEntity<Void> inviteMember(
            @PathVariable Long workspaceId,
            @Valid @RequestBody InviteMemberRequest request,
            Principal principal) {
        workspaceService.inviteMember(workspaceId, request.getEmail(), principal);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<AcceptInviteResponse> acceptInvite(
            @Valid @RequestBody AcceptInviteRequest request,
            Principal principal) {
        return ResponseEntity.ok(workspaceService.acceptInvite(request.getToken(), principal));
    }
}
