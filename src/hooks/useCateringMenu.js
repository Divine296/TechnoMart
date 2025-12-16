import { useState, useEffect, useMemo } from 'react';
import menuService from '@/api/services/menuService';

export const useCateringMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await menuService.getMenuItems({ archived: false });
      const items = response?.data || [];
      setMenuItems(items);
    } catch (err) {
      const message =
        err?.message || err?.details?.message || 'Failed to load menu items';
      setError(message);
      setMenuItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const categorizedMenu = useMemo(() => {
    if (!menuItems.length) return [];

    // Group items by category
    const categoryMap = {};
    const allItems = [];

    menuItems.forEach((item) => {
      const category = item.category || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = {
          id: category.toLowerCase().replace(/\s+/g, '-'),
          name: category,
          items: [],
        };
      }
      categoryMap[category].items.push(item);
      allItems.push(item);
    });

    // Convert to array and sort by name
    const categories = Object.values(categoryMap).sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    // Add "All" category at the beginning
    const result = [
      {
        id: 'all',
        name: 'All Items',
        items: allItems,
      },
      ...categories,
    ];

    return result;
  }, [menuItems]);

  return {
    menuItems,
    categorizedMenu,
    isLoading,
    error,
    refetch: fetchMenuItems,
  };
};

export default useCateringMenu;
