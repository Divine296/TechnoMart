/**
 * Analytics Helper Functions
 * Shared utility functions for data transformation and calculations
 */

/**
 * Calculate hours between two time strings
 * @param {string} start - Start time (e.g., "09:00")
 * @param {string} end - End time (e.g., "17:00")
 * @returns {number} Hours difference
 */
export const toHours = (start, end) => {
  if (!start || !end) return 0;
  const [sh, sm] = String(start).split(':').map(Number);
  const [eh, em] = String(end).split(':').map(Number);
  if (Number.isNaN(sh) || Number.isNaN(eh)) return 0;
  return eh + (em || 0) / 60 - (sh + (sm || 0) / 60);
};

/**
 * Group data by date field and sum a numeric field
 * @param {Array} data - Array of objects
 * @param {string} dateField - Field containing date
 * @param {string} sumField - Field to sum
 * @returns {Array} Grouped data with {name, total}
 */
export const groupByDate = (data, dateField, sumField) => {
  if (!data?.length) return [];

  const grouped = {};
  data.forEach((item) => {
    const date = new Date(item[dateField]).toLocaleDateString();
    grouped[date] = (grouped[date] || 0) + (item[sumField] || 0);
  });

  return Object.entries(grouped)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => new Date(a.name) - new Date(b.name));
};

/**
 * Group data by month and sum a numeric field
 * @param {Array} data - Array of objects
 * @param {string} dateField - Field containing date
 * @param {string} sumField - Field to sum
 * @returns {Array} Grouped data with {name, amount}
 */
export const groupByMonth = (data, dateField, sumField) => {
  if (!data?.length) return [];

  const map = {};
  data.forEach((item) => {
    const d = new Date(item[dateField]);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + (item[sumField] || 0);
  });

  return Object.entries(map)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([name, amount]) => ({ name, amount }));
};

/**
 * Group data by date and calculate multiple aggregations
 * @param {Array} data - Array of objects
 * @param {string} dateField - Field containing date
 * @param {Object} aggregations - Object mapping field names to aggregation functions
 * @returns {Array} Grouped data with aggregated values
 */
export const groupByDateMultiple = (data, dateField, aggregations) => {
  if (!data?.length) return [];

  const map = {};
  data.forEach((item) => {
    const date = new Date(item[dateField]).toLocaleDateString();

    if (!map[date]) {
      map[date] = { name: date };
      Object.keys(aggregations).forEach((key) => {
        map[date][key] = 0;
      });
    }

    Object.entries(aggregations).forEach(([key, config]) => {
      if (config.type === 'sum') {
        map[date][key] += item[config.field] || 0;
      } else if (config.type === 'count') {
        map[date][key] += 1;
      }
    });
  });

  return Object.values(map).sort(
    (a, b) => new Date(a.name) - new Date(b.name)
  );
};

/**
 * Calculate items expiring within threshold days
 * @param {Array} items - Inventory items with expiryDate
 * @param {number} thresholdDays - Days threshold
 * @returns {Array} Items expiring soon with daysToExpiry calculated
 */
export const calculateExpiringItems = (items, thresholdDays = 7) => {
  const now = new Date();

  return items
    .filter((i) => i.expiryDate)
    .map((i) => ({
      ...i,
      daysToExpiry: Math.ceil(
        (new Date(i.expiryDate) - now) / (1000 * 60 * 60 * 24)
      ),
    }))
    .filter((i) => i.daysToExpiry <= thresholdDays)
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
};

/**
 * Calculate low stock items
 * @param {Array} items - Inventory items with quantity and minStock
 * @returns {number} Count of low stock items
 */
export const calculateLowStockCount = (items) => {
  return items.filter((i) => i.quantity <= i.minStock).length;
};

/**
 * Transform sales data for daily chart
 * @param {Array} recentSales - Sales data with date and total
 * @returns {Array} Transformed data with {name, amount}
 */
export const transformDailySales = (recentSales) => {
  if (!recentSales?.length) return [];

  const grouped = {};
  recentSales.forEach((sale) => {
    const date = new Date(sale.date).toLocaleDateString();
    grouped[date] = (grouped[date] || 0) + sale.total;
  });

  return Object.entries(grouped)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => new Date(a.name) - new Date(b.name));
};

/**
 * Transform sales data for monthly chart
 * @param {Array} recentSales - Sales data with date and total
 * @returns {Array} Transformed data with {name, amount}
 */
export const transformMonthlySales = (recentSales) => {
  if (!recentSales?.length) return [];

  const map = {};
  recentSales.forEach((sale) => {
    const d = new Date(sale.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map[key] = (map[key] || 0) + sale.total;
  });

  return Object.entries(map)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([name, amount]) => ({ name, amount }));
};

/**
 * Transform payment data by method
 * @param {Object} byMethod - Object mapping payment methods to amounts
 * @returns {Array} Transformed data with {name, amount}
 */
export const transformPaymentsByMethod = (byMethod) => {
  if (!byMethod) return [];

  return Object.entries(byMethod).map(([name, amount]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    amount,
  }));
};

/**
 * Calculate staff hours by employee
 * @param {Array} employees - List of employees with id and name
 * @param {Array} schedule - Schedule entries with employeeId, startTime, endTime
 * @returns {Array} Hours by staff member with {name, hours}
 */
export const calculateStaffHours = (employees, schedule) => {
  const nameById = Object.fromEntries(
    employees.map((e) => [e.id, e.name])
  );

  const map = {};
  for (const s of schedule) {
    const h = toHours(s.startTime, s.endTime);
    const name = s.employeeName || nameById[s.employeeId] || 'Unknown';
    map[name] = (map[name] || 0) + h;
  }

  return Object.entries(map).map(([name, hrs]) => ({
    name,
    hours: Math.round(hrs * 10) / 10,
  }));
};

/**
 * Format currency helper (matches existing usage)
 * @param {number} n - Amount
 * @returns {string} Formatted currency
 */
export const currency = (n) =>
  `₱${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
