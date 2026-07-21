import { useState, useEffect, useMemo, useCallback } from 'react';
import { eventService } from '../services/eventService';

const DEFAULT_FILTERS = {
  status: 'all',
  category: 'all',
  featured: 'all',
};

export function useEvents({
  initialPage = 1,
  initialPageSize = 10,
  initialSortBy = 'event_date',
  initialSortOrder = 'desc',
  initialSearch = '',
  initialFilters = DEFAULT_FILTERS,
} = {}) {
  const [events, setEvents] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState(initialFilters);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / pageSize)),
    [count, pageSize]
  );

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const featuredFilter =
        filters.featured === 'true'
          ? true
          : filters.featured === 'false'
          ? false
          : 'all';

      const response = await eventService.getEvents({
        search,
        status: filters.status,
        category: filters.category,
        featured: featuredFilter,
        sortBy,
        sortOrder,
        page,
        pageSize,
      });

      if (!response.success) {
        setError(response.error);
        return response;
      }

      setEvents(response.data.items || []);
      setCount(response.data.count || 0);
      return response;
    } catch (err) {
      setError(err);
      return { success: false, error: err, data: null };
    } finally {
      setLoading(false);
    }
  }, [search, filters, sortBy, sortOrder, page, pageSize]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const refresh = useCallback(() => loadEvents(), [loadEvents]);

  const createEvent = useCallback(
    async (data) => {
      const response = await eventService.createEvent(data);
      if (response.success) {
        await refresh();
      } else {
        setError(response.error);
      }
      return response;
    },
    [refresh]
  );

  const updateEvent = useCallback(
    async (id, data) => {
      const response = await eventService.updateEvent(id, data);
      if (response.success) {
        await refresh();
      } else {
        setError(response.error);
      }
      return response;
    },
    [refresh]
  );

  const deleteEvent = useCallback(
    async (id) => {
      const response = await eventService.deleteEvent(id);
      if (response.success) {
        await refresh();
      } else {
        setError(response.error);
      }
      return response;
    },
    [refresh]
  );

  const togglePublish = useCallback(
    async (id) => {
      const response = await eventService.togglePublish(id);
      if (response.success) {
        await refresh();
      } else {
        setError(response.error);
      }
      return response;
    },
    [refresh]
  );

  const toggleFeatured = useCallback(
    async (id) => {
      const response = await eventService.toggleFeatured(id);
      if (response.success) {
        await refresh();
      } else {
        setError(response.error);
      }
      return response;
    },
    [refresh]
  );

  const duplicateEvent = useCallback(
    async (id) => {
      const response = await eventService.duplicateEvent(id);
      if (response.success) {
        await refresh();
      } else {
        setError(response.error);
      }
      return response;
    },
    [refresh]
  );

  const filteredEvents = useMemo(() => events, [events]);

  return {
    events: filteredEvents,
    count,
    loading,
    error,
    search,
    setSearch,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    refresh,
    createEvent,
    updateEvent,
    deleteEvent,
    togglePublish,
    toggleFeatured,
    duplicateEvent,
  };
}


