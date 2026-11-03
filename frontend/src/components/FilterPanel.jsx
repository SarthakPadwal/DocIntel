import React from 'react';
import './FilterPanel.css';

const FilterPanel = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({ ...filters, [name]: value });
  };

  return (
    <div className="filter-panel">
      <div className="filter-group">
        <label>Sort by</label>
        <select name="sort" value={filters.sort || ''} onChange={handleChange} className="form-select filter-select">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="document_date">Document Date</option>
          <option value="due_date">Due Date</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Type</label>
        <select name="document_type" value={filters.document_type || ''} onChange={handleChange} className="form-select filter-select">
          <option value="">All Types</option>
          <option value="Invoice">Invoice</option>
          <option value="Quotation">Quotation</option>
          <option value="Tender">Tender</option>
          <option value="Purchase Document">Purchase Document</option>
          <option value="Contract">Contract</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Status</label>
        <select name="status" value={filters.status || ''} onChange={handleChange} className="form-select filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="done">Done</option>
          <option value="failed">Failed</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
