import React, { useState, useEffect } from 'react';

const ComparisonTable = ({ data }) => {
    const [activeCategory, setActiveCategory] = useState('mismatches');

    useEffect(() => {
        if (data) {
            setActiveCategory('mismatches');
        }
    }, [data]);

    if (!data) return null;

    const { summary, matches, mismatches, only_in_svn, only_in_checklist } = data;

    const handleCategoryClick = (category) => {
        setActiveCategory(prev => prev === category ? null : category);
    };

    const renderTable = (title, items, columns) => {
        if (!items || items.length === 0) return null;
        return (
            <div style={{ marginTop: '2rem', animation: 'fadeIn 0.3s ease-in-out' }}>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{title} ({items.length})</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr>
                                {columns.map((col, idx) => (
                                    <th key={idx} style={{
                                        border: '1px solid var(--border-color)',
                                        padding: '12px',
                                        textAlign: 'left',
                                        backgroundColor: 'var(--bg-secondary)',
                                        color: 'var(--text-primary)',
                                        fontWeight: '600'
                                    }}>{col.header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <tr style={{
                                        backgroundColor: item.inter_sheet_conflict ? '#fff3cd' : 'var(--bg-card)',
                                        borderLeft: item.inter_sheet_conflict ? '4px solid #f59e0b' : 'none'
                                    }}>
                                        {columns.map((col, cIdx) => (
                                            <td key={cIdx} style={{
                                                border: '1px solid var(--border-color)',
                                                padding: '12px',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {col.accessor(item)}
                                            </td>
                                        ))}
                                    </tr>
                                    {item.inter_sheet_conflict && item.conflict_comment && (
                                        <tr style={{ backgroundColor: '#fff9e6' }}>
                                            <td colSpan={columns.length} style={{
                                                border: '1px solid var(--border-color)',
                                                padding: '8px 12px',
                                                fontSize: '0.85rem',
                                                color: '#856404',
                                                backgroundColor: '#fff3cd',
                                                borderLeft: '4px solid #f59e0b'
                                            }}>
                                                <span style={{ marginRight: '8px', fontSize: '1rem' }}>⚠️</span>
                                                <strong>Version Conflict:</strong> {item.conflict_comment}
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const getCardStyle = (category, color) => ({
        padding: '1rem',
        background: activeCategory === category ? `${color}20` : 'var(--bg-secondary)',
        borderRadius: '8px',
        cursor: 'pointer',
        border: activeCategory === category ? `2px solid ${color}` : '2px solid transparent',
        transition: 'all 0.2s ease',
        transform: activeCategory === category ? 'scale(1.02)' : 'scale(1)'
    });

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Comparison Results</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div
                    onClick={() => handleCategoryClick('matches')}
                    style={getCardStyle('matches', '#10b981')}
                >
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Matches</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{summary.matches}</div>
                </div>
                <div
                    onClick={() => handleCategoryClick('mismatches')}
                    style={getCardStyle('mismatches', '#ef4444')}
                >
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Mismatches</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>{summary.mismatches}</div>
                </div>
                <div
                    onClick={() => handleCategoryClick('only_in_svn')}
                    style={getCardStyle('only_in_svn', '#f59e0b')}
                >
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Only in SVN</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f59e0b' }}>{summary.only_in_svn}</div>
                </div>
                <div
                    onClick={() => handleCategoryClick('only_in_checklist')}
                    style={getCardStyle('only_in_checklist', '#6366f1')}
                >
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Only in Checklist</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#6366f1' }}>{summary.only_in_checklist}</div>
                </div>
            </div>

            {(!activeCategory || activeCategory === 'mismatches') && renderTable("Mismatches", mismatches, [
                { header: "File", accessor: i => i.filename },
                { header: "SVN Rev", accessor: i => i.svn_revision_raw },
                { header: "Checklist Ver", accessor: i => i.checklist_version_raw },
                { header: "Author", accessor: i => i.last_changed_author }
            ])}

            {(!activeCategory || activeCategory === 'matches') && renderTable("Matches", matches, [
                { header: "File", accessor: i => i.filename },
                { header: "Revision", accessor: i => i.svn_revision_raw },
                { header: "Author", accessor: i => i.last_changed_author }
            ])}

            {(!activeCategory || activeCategory === 'only_in_svn') && renderTable("Only in SVN", only_in_svn, [
                { header: "File", accessor: i => i.filename },
                { header: "Revision", accessor: i => i.last_changed_revision_raw },
                { header: "Author", accessor: i => i.last_changed_author }
            ])}

            {(!activeCategory || activeCategory === 'only_in_checklist') && renderTable("Only in Checklist", only_in_checklist, [
                { header: "File", accessor: i => i.filename },
                { header: "Version Closed", accessor: i => i.version_closed_raw }
            ])}
        </div>
    );
};

export default ComparisonTable;
