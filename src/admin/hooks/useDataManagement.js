import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

/**
 * Hook for managing paginated data
 */
export function usePagination(items = [], itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = useCallback((page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  }, [totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    currentItems,
    goToPage,
    reset,
  };
}

/**
 * Hook for managing searchable data
 */
export function useSearch(items = [], searchKeys = []) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = items.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return searchKeys.some((key) => {
      const value = item[key];
      return value && value.toString().toLowerCase().includes(query);
    });
  });

  const clear = () => setSearchQuery('');

  return {
    searchQuery,
    setSearchQuery,
    filtered,
    clear,
  };
}

/**
 * Hook for managing sorted data
 */
export function useSorting(items = []) {
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const sorted = [...items].sort((a, b) => {
    if (!sortBy) return 0;

    const valueA = a[sortBy];
    const valueB = b[sortBy];

    if (valueA === valueB) return 0;

    const comparison = valueA < valueB ? -1 : 1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  return {
    sorted,
    sortBy,
    sortOrder,
    handleSort,
  };
}

/**
 * Hook for managing form state with validation
 */
export function useForm(initialValues, onSubmit, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    if (validate) {
      const result = validate({ ...values }, name);
      const fieldError = (result && typeof result === 'object') ? result[name] : result;
      setErrors((prev) => ({
        ...prev,
        [name]: fieldError,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    const newErrors = validate ? validate(values) : {};
    setErrors(newErrors);

    try {
      if (Object.keys(newErrors).length === 0) {
        await onSubmit(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
  };
}

/**
 * Hook for managing async data loading
 */
export function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = async () => {
    setStatus('pending');
    setValue(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setValue(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  };

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { execute, status, value, error };
}

// Re-export useToast for convenience
export { useToast };
