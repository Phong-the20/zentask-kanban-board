package vn.edu.fpt.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsResponse {

    private long totalTasks;
    private double completedPercentage;
    private long activeMembers;
    private List<ChartEntry> taskColumnData;
    private List<ChartEntry> priorityData;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChartEntry {
        private String name;
        private long count;
    }
}
