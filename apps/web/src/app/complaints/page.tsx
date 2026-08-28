'use client';

import React, { useEffect, useState } from 'react';
import { complaintRepository } from '@/lib/repositories/complaint.repository';
import { Complaint, ComplaintFilters } from '@/lib/types';
import { ComplaintCard } from '@/components/complaints/ComplaintCard';
import { ComplaintFiltersBar } from '@/components/complaints/ComplaintFilters';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Map, PlusCircle, LayoutGrid, ListFilter } from 'lucide-react';
import Link from 'next/link';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<ComplaintFilters>({
    category: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    searchQuery: '',
    sortBy: 'newest',
  });

  const loadData = async () => {
    setLoading(true);
    const data = await complaintRepository.getAllComplaints(filters);
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = complaintRepository.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [filters]);

  const handleUpvote = async (id: string) => {
    await complaintRepository.upvoteComplaint(id, 'user-001');
    loadData();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
      <PageHeader
        title="Explore Civic Complaints"
        description="Transparent directory of reported municipal infrastructure, public safety, and environmental issues across the city."
        action={
          <div className="flex items-center gap-3">
            <Link href="/map">
              <Button variant="outline" leftIcon={<Map className="w-4 h-4" />}>
                View on Map
              </Button>
            </Link>
            <Link href="/report">
              <Button variant="primary" leftIcon={<PlusCircle className="w-4 h-4" />}>
                Report Issue
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Bar */}
      <div className="mb-8">
        <ComplaintFiltersBar
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          onReset={() =>
            setFilters({
              category: 'ALL',
              severity: 'ALL',
              status: 'ALL',
              searchQuery: '',
              sortBy: 'newest',
            })
          }
        />
      </div>

      {/* List / Grid Content */}
      {loading ? (
        <LoadingState message="Loading complaints catalog..." height="h-96" />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints match your search"
          description="Try adjusting or clearing your filters to see more civic reports."
          actionLabel="Reset All Filters"
          onAction={() =>
            setFilters({
              category: 'ALL',
              severity: 'ALL',
              status: 'ALL',
              searchQuery: '',
              sortBy: 'newest',
            })
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              onUpvote={handleUpvote}
              isUpvoted={complaint.upvotedByUserIds?.includes('user-001')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
