import React, { useState, useEffect } from 'react';
import { UserService } from '../services/api';
import { Link } from 'react-router-dom';

const rolLabel = (idRol) => {
  const roles = { 1: 'Admin', 2: 'Coordonator', 5: 'User' };
  return roles[idRol] || `Rol ${idRol}`;
};

const rolBadge = (idRol) => {
  const colors = { 1: '#DC2626', 2: '#2563EB', 5: '#16A34A' };
  return colors[idRol] || '#6B7280';
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await UserService.getAll();
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Eroare la încărcarea utilizatorilor');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Sigur vrei să ștergi acest utilizator?')) {
      try {
        await UserService.delete(id);
        setUsers(users.filter(user => user.id !== id));
      } catch (err) {
        alert('Nu s-a putut șterge utilizatorul!');
      }
    }
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={styles.centered}>
      <div style={styles.spinner} />
      <p style={{ color: '#6B7280', marginTop: 12 }}>Se încarcă utilizatorii...</p>
    </div>
  );

  if (error) return (
    <div style={styles.centered}>
      <p style={{ color: '#DC2626' }}>{error}</p>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Panou Administrare</p>
          <h1 style={styles.title}>Utilizatori</h1>
          <p style={styles.subtitle}>{users.length} conturi înregistrate în sistem</p>
        </div>
        <Link to="/useri/new" style={styles.btnPrimary}>
          + Utilizator nou
        </Link>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="Caută după email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button style={styles.clearBtn} onClick={() => setSearch('')}>✕</button>
        )}
      </div>

      {/* Table */}
      <div style={styles.card}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: 32, margin: 0 }}>👤</p>
            <p style={{ color: '#6B7280', marginTop: 8 }}>
              {search ? 'Niciun utilizator găsit pentru căutarea ta.' : 'Nu există utilizatori înregistrați.'}
            </p>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['ID', 'Email', 'Rol', 'Acțiuni'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr
                  key={user.id}
                  style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#F9FAFB'}
                >
                  <td style={styles.td}>
                    <span style={styles.idBadge}>#{user.id}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.email}>{user.email}</span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.rolBadge, backgroundColor: rolBadge(user.idRol) }}>
                      {rolLabel(user.idRol)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <Link to={`/utilizatori/${user.id}`} style={styles.btnInfo}>
                        Detalii
                      </Link>
                      <button
                        onClick={() => handleDelete(user.id)}
                        style={styles.btnDanger}
                      >
                        Șterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer count */}
      {filtered.length > 0 && (
        <p style={styles.footerCount}>
          {filtered.length} din {users.length} utilizatori afișați
        </p>
      )}
    </div>
  );
};

const styles = {
  page: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '40px 24px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #E5E7EB',
    borderTop: '3px solid #2563EB',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    flexWrap: 'wrap',
    gap: 16,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#2563EB',
    margin: '0 0 6px 0',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#111827',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    margin: 0,
  },
  btnPrimary: {
    backgroundColor: '#2563EB',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: 8,
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 14,
    display: 'inline-block',
    whiteSpace: 'nowrap',
  },
  searchWrap: {
    position: 'relative',
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    fontSize: 14,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '10px 40px 10px 36px',
    border: '1px solid #D1D5DB',
    borderRadius: 8,
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
    color: '#111827',
    backgroundColor: '#fff',
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9CA3AF',
    fontSize: 14,
    padding: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
  },
  td: {
    padding: '14px 16px',
    fontSize: 14,
    color: '#374151',
    borderBottom: '1px solid #F3F4F6',
    verticalAlign: 'middle',
  },
  idBadge: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    padding: '2px 8px',
    borderRadius: 4,
  },
  email: {
    fontWeight: 500,
    color: '#111827',
  },
  rolBadge: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    padding: '3px 10px',
    borderRadius: 20,
    display: 'inline-block',
  },
  actions: {
    display: 'flex',
    gap: 8,
  },
  btnInfo: {
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    padding: '6px 14px',
    borderRadius: 6,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid #BFDBFE',
  },
  btnDanger: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid #FECACA',
    cursor: 'pointer',
  },
  footerCount: {
    marginTop: 12,
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'right',
  },
};

export default UserList;