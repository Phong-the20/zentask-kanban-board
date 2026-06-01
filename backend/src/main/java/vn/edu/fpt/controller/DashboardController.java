package vn.edu.fpt.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.fpt.dto.response.AnalyticsResponse;
import vn.edu.fpt.service.AnalyticsService;

@RestController
@RequestMapping("/api/v1/workspaces/{workspaceId}/analytics")
@RequiredArgsConstructor
public class DashboardController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getAnalytics(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(analyticsService.getAnalytics(workspaceId));
    }
}
