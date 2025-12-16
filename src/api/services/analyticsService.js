import apiClient from '../client';

class AnalyticsService {
  /**
   * Get sales report with time-series data
   * @param {string} range - Time range: "24h", "7d", "30d", or "start..end"
   */
  async getSalesReport(range = '7d') {
    return apiClient.get(`/reports/sales?range=${range}`);
  }

  /**
   * Get inventory report with stock levels
   */
  async getInventoryReport() {
    return apiClient.get('/reports/inventory');
  }

  /**
   * Get orders report with counts by status
   * @param {string} range - Time range for filtering
   */
  async getOrdersReport(range = '7d') {
    return apiClient.get(`/reports/orders?range=${range}`);
  }

  /**
   * Get staff attendance report
   * @param {string} range - Time range for filtering
   */
  async getAttendanceReport(range = '7d') {
    return apiClient.get(`/reports/staff-attendance?range=${range}`);
  }

  /**
   * Get customer purchase history
   * @param {Object} params - Filter parameters
   * @param {string} params.customer - Customer name filter
   */
  async getCustomerHistory(params = {}) {
    const queryParams = new URLSearchParams(params).toString();
    return apiClient.get(`/reports/customer-history?${queryParams}`);
  }

  /**
   * Get comprehensive dashboard stats (convenience method)
   * @param {string} range - Time range
   */
  async getDashboardStats(range = 'today') {
    return apiClient.get(`/reports/dashboard?range=${range}`);
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
