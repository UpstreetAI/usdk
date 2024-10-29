'use client';

import { formatDateStringMoment } from '@/utils/helpers/dates';
import React, { useEffect, useState } from 'react';

export interface AgentsProps {
  creditsUsageHistory: any;
}

export function CreditsUsageHistory({ creditsUsageHistory }: AgentsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('paginated'); // 'paginated' or 'infinite'
  const itemsPerPage = 10;

  const getPageNumbers = () => {
    const totalPages = Math.ceil(creditsUsageHistory.length / itemsPerPage);
    const pageNumbers = [];
    pageNumbers.push(1);
    for (let i = currentPage; i <= currentPage + 2 && i <= totalPages; i++) {
      if (i !== 1) {
        pageNumbers.push(i);
      }
    }
    if (totalPages !== 1 && totalPages !== pageNumbers[pageNumbers.length - 1]) {
      pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = viewMode === 'paginated'
    ? creditsUsageHistory.slice(indexOfFirstItem, indexOfLastItem)
    : creditsUsageHistory;

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(currentPage + 1);
  const prevPage = () => setCurrentPage(currentPage - 1);

  const handleScroll = () => {
    if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight) return;
    setCurrentPage(prevPage => prevPage + 1);
  };

  useEffect(() => {
    if (viewMode === 'infinite') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [viewMode]);

  useEffect(() => {
    if (viewMode === 'infinite') {
      setCurrentPage(1); // Reset to show all items
    }
  }, [viewMode]);

  return (
    <div className="m-auto w-full">
      <div className="sm:flex sm:flex-col sm:align-center py-2 md:py-4">
        <button
          className="ml-auto px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-900"
          onClick={() => setViewMode(viewMode === 'paginated' ? 'infinite' : 'paginated')}
        >
          Switch to {viewMode === 'paginated' ? 'Infinite Scroll' : 'Paginated View'}
        </button>
      </div>
      <div className="w-full m-auto my-4">
        <div>
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-scroll md:overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-400">
                <thead className="text-xs text-[rgba(0,0,0,0.6)] uppercase" style={{ backgroundColor: 'rgba(86, 154, 212, 0.2)' }}>
                <tr>
                  <th key={'info'} scope="col" className="p-6">Service</th>
                  <th key={'creds'} scope="col" className="p-6">Credits Used</th>
                  <th key={'agent_id'} scope="col" className="p-6">Agent ID</th>
                  <th key={'preview'} scope="col" className="p-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {currentItems?.map((creditHistoryItem: any, i: number) => (
                  <tr className="hover:bg-border text-white text-[rgba(0,0,0,0.8)] mt-1" key={i}>
                    <td key={'t-2'} className="px-6 py-4 text-md capitalize align-top">
                      {creditHistoryItem?.service}
                    </td>
                    <td key={'t-3'} className="px-6 py-4 text-md capitalize align-top">
                      {creditHistoryItem?.amount}
                    </td>
                    <td key={'t-4'} className="px-6 py-4 text-md align-top">
                      {creditHistoryItem?.agent_id}
                    </td>
                    <td key={'t-1'} className="px-6 py-4 min-w-80 text-right text-md capitalize align-top">
                      {formatDateStringMoment(creditHistoryItem?.created_at, 'MMMM Do YYYY, h:mm:ss A')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden block space-y-4">
            {currentItems?.map((creditHistoryItem: any, i: number) => (
              <div className="bg-[rgba(255,255,255,0.1)] rounded-lg p-4" key={i}>
                <div className="flex flex-col space-y-2">
                  <div className="text-lg font-bold text-white">
                    {creditHistoryItem?.service}
                  </div>
                  <div className="text-md text-white">
                    Credits Used: {creditHistoryItem?.amount}
                  </div>
                  <div className="text-md text-white">
                    Agent ID: {creditHistoryItem?.agent_id}
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDateStringMoment(creditHistoryItem?.created_at, 'MMMM Do YYYY, h:mm:ss A')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {viewMode === 'paginated' && (
            <div className="flex justify-center mt-4">
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-l hover:bg-gray-900"
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              {getPageNumbers().map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`px-4 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 ${
                    pageNumber === currentPage ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => paginate(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-r hover:bg-gray-900"
                onClick={nextPage}
                disabled={indexOfLastItem >= creditsUsageHistory.length}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
