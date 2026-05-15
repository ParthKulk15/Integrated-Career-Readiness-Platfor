package com.career.platform.dto;

import java.util.Map;

/**
 * DTO for dashboard summary statistics (Recruiter Dashboard).
 */
public class DashboardStats {
    private long totalCandidates;
    private double avgReadinessScore;
    private long shortlistedCount;
    private long activeJobPosts;
    private long newApplicationsToday;
    private Map<String, Long> statusBreakdown;

    public DashboardStats() {}

    public long getTotalCandidates() { return totalCandidates; }
    public void setTotalCandidates(long totalCandidates) { this.totalCandidates = totalCandidates; }

    public double getAvgReadinessScore() { return avgReadinessScore; }
    public void setAvgReadinessScore(double avgReadinessScore) { this.avgReadinessScore = avgReadinessScore; }

    public long getShortlistedCount() { return shortlistedCount; }
    public void setShortlistedCount(long shortlistedCount) { this.shortlistedCount = shortlistedCount; }

    public long getActiveJobPosts() { return activeJobPosts; }
    public void setActiveJobPosts(long activeJobPosts) { this.activeJobPosts = activeJobPosts; }

    public long getNewApplicationsToday() { return newApplicationsToday; }
    public void setNewApplicationsToday(long newApplicationsToday) { this.newApplicationsToday = newApplicationsToday; }

    public Map<String, Long> getStatusBreakdown() { return statusBreakdown; }
    public void setStatusBreakdown(Map<String, Long> statusBreakdown) { this.statusBreakdown = statusBreakdown; }
}
