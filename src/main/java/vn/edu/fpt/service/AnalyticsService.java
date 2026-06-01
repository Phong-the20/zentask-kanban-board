package vn.edu.fpt.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.fpt.dto.response.AnalyticsResponse;
import vn.edu.fpt.entity.Board;
import vn.edu.fpt.entity.Priority;
import vn.edu.fpt.entity.Task;
import vn.edu.fpt.entity.TaskColumn;
import vn.edu.fpt.repository.BoardRepository;
import vn.edu.fpt.repository.TaskColumnRepository;
import vn.edu.fpt.repository.TaskRepository;
import vn.edu.fpt.repository.WorkspaceMemberRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TaskRepository taskRepository;
    private final BoardRepository boardRepository;
    private final TaskColumnRepository columnRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final WorkspaceService workspaceService;

    public AnalyticsResponse getAnalytics(Long workspaceId) {
        workspaceService.checkMembership(workspaceId);

        List<Board> boards = boardRepository.findByWorkspaceIdOrderByCreatedAtAsc(workspaceId);
        List<Long> boardIds = boards.stream().map(Board::getId).collect(Collectors.toList());

        Map<String, Long> columnCounts = new LinkedHashMap<>();
        Map<Long, String> colIdToName = new HashMap<>();
        Map<Long, Boolean> colIdToDone = new HashMap<>();
        List<Task> allTasks = new ArrayList<>();

        if (!boardIds.isEmpty()) {
            List<TaskColumn> allColumns = columnRepository.findByBoardIdIn(boardIds);
            for (TaskColumn col : allColumns) {
                columnCounts.put(col.getName(), 0L);
                colIdToName.put(col.getId(), col.getName());
                colIdToDone.put(col.getId(), col.isDoneColumn());
            }
            List<Long> colIds = allColumns.stream().map(TaskColumn::getId).collect(Collectors.toList());
            allTasks = taskRepository.findByColumnIdIn(colIds);
        }

        long totalTasks = allTasks.size();

        Map<String, Long> priorityCounts = new LinkedHashMap<>();
        for (Priority p : Priority.values()) {
            priorityCounts.put(p.name(), 0L);
        }
        for (Task t : allTasks) {
            String key = t.getPriority() != null ? t.getPriority().name() : "LOW";
            priorityCounts.merge(key, 1L, Long::sum);
        }

        for (Task t : allTasks) {
            String colName = colIdToName.get(t.getColumn().getId());
            if (colName != null) {
                columnCounts.merge(colName, 1L, Long::sum);
            }
        }

        long doneTasks = allTasks.stream()
                .filter(t -> colIdToDone.getOrDefault(t.getColumn().getId(), false))
                .count();
        double completedPercentage = totalTasks > 0
                ? Math.round((double) doneTasks / totalTasks * 1000.0) / 10.0
                : 0;

        long activeMembers = memberRepository.countByWorkspaceId(workspaceId);

        List<AnalyticsResponse.ChartEntry> taskColumnData = columnCounts.entrySet().stream()
                .map(e -> new AnalyticsResponse.ChartEntry(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        List<AnalyticsResponse.ChartEntry> priorityData = priorityCounts.entrySet().stream()
                .map(e -> new AnalyticsResponse.ChartEntry(e.getKey(), e.getValue()))
                .collect(Collectors.toList());

        return AnalyticsResponse.builder()
                .totalTasks(totalTasks)
                .completedPercentage(completedPercentage)
                .activeMembers(activeMembers)
                .taskColumnData(taskColumnData)
                .priorityData(priorityData)
                .build();
    }
}
