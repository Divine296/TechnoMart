import apiClient from '../client';

class DashboardService {
  async getDashboardStats(timeRange = 'today') {
    return apiClient.get(`/reports/dashboard?range=${timeRange}`);
  }

  async getSalesData(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/reports/sales?${queryParams}`);
  }

  async getRecentActivity(limit = 10) {
    // Use dashboard endpoint with limit parameter if needed
    const response = await apiClient.get('/reports/dashboard?range=today');
    if (response.success && response.data.recentSales) {
      return {
        success: true,
        data: response.data.recentSales.slice(0, limit),
      };
    }
    return response;
  }

  async getPopularItems(timeRange = 'week') {
    // Use dashboard endpoint for popular items
    const response = await apiClient.get(`/reports/dashboard?range=${timeRange}`);
    if (response.success && response.data.popularItems) {
      return {
        success: true,
        data: response.data.popularItems,
      };
    }
    return response;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
