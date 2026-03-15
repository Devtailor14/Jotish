import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import { fetchEmployees } from '../utils/api';
import styles from '../styles/List.module.css';

export default function List() {
  const { logout } = useAuth();
  const { employees, setEmployees } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (employees.length === 0) {
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const filteredEmployees = useMemo(() => {
    if (!search.trim()) return employees;
    const q = search.toLowerCase();
    return employees.filter(emp =>
      (emp.name || '').toLowerCase().includes(q) ||
      (emp.city || '').toLowerCase().includes(q) ||
      (emp.position || '').toLowerCase().includes(q)
    );
  }, [employees, search]);

  const ROW_HEIGHT = 50;
  const CONTAINER_HEIGHT = 500;

  const {
    containerRef,
    onScroll,
    visibleItems,
    totalHeight,
    offsetY,
  } = useVirtualScroll({
    items: filteredEmployees,
    rowHeight: ROW_HEIGHT,
    containerHeight: CONTAINER_HEIGHT,
    buffer: 5,
  });

  const totalSalary = useMemo(() => {
    return employees.reduce((sum, e) => sum + (e.salary || 0), 0);
  }, [employees]);

  const uniqueCities = useMemo(() => {
    const cities = new Set(employees.map(e => e.city || ''));
    return cities.size;
  }, [employees]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className={styles['list-page']}>
        <div className={styles['loading-container']}>
          <div style={{ textAlign: 'center' }}>
            <div className={styles['loading-spinner']}></div>
            <p style={{ marginTop: '1rem' }}>Loading employee data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['list-page']}>
        <div className={styles['error-container']}>
          <p>Failed to load data: {error}</p>
          <button className={styles['retry-btn']} onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['list-page']}>
      <div className={styles['list-header']}>
        <h1>Employee Directory</h1>
        <div className={styles['list-header-actions']}>
          <button className={styles['btn-nav']} onClick={() => navigate('/analytics')}>
            📊 Analytics
          </button>
          <button className={styles['btn-logout']} onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      <div className={styles['list-stats']}>
        <div className={styles['stat-card']}>
          <div className={styles['stat-value']}>{employees.length}</div>
          <div className={styles['stat-label']}>Total Employees</div>
        </div>
        <div className={styles['stat-card']}>
          <div className={styles['stat-value']}>{uniqueCities}</div>
          <div className={styles['stat-label']}>Cities</div>
        </div>
        <div className={styles['stat-card']}>
          <div className={styles['stat-value']}>
            ₹{totalSalary.toLocaleString('en-IN')}
          </div>
          <div className={styles['stat-label']}>Total Salary</div>
        </div>
      </div>

      <div className={styles['search-bar']}>
        <input
          type="text"
          placeholder="Search by name, city, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="search-input"
        />
      </div>

      <div className={styles['table-container']}>
        <div className={styles['table-header-row']}>
          <span>#</span>
          <span>Name</span>
          <span>Position</span>
          <span>Salary</span>
          <span>City</span>
          <span>Action</span>
        </div>

        <div
          className={styles['table-viewport']}
          ref={containerRef}
          onScroll={onScroll}
        >
          <div className={styles['table-spacer']} style={{ height: totalHeight }}>
            <div
              className={styles['table-body']}
              style={{ transform: `translateY(${offsetY}px)` }}
            >
              {visibleItems.map((emp) => (
                <div
                  key={emp._virtualIndex}
                  className={styles['table-row']}
                  style={{ height: ROW_HEIGHT }}
                  onClick={() => navigate(`/details/${emp._virtualIndex}`)}
                >
                  <span className={styles['cell-id']}>{emp._virtualIndex + 1}</span>
                  <span className={styles['cell-name']}>{emp.name}</span>
                  <span className={styles['cell-email']}>{emp.position}</span>
                  <span className={styles['cell-salary']}>
                    ₹{(emp.salary || 0).toLocaleString('en-IN')}
                  </span>
                  <span className={styles['cell-city']}>{emp.city}</span>
                  <span className={styles['cell-action']}>View →</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p style={{
        textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem',
        marginTop: '1rem', animation: 'fadeIn 0.5s ease 0.3s backwards'
      }}>
        Showing {filteredEmployees.length} of {employees.length} employees • Custom virtualized rendering
      </p>
    </div>
  );
}
