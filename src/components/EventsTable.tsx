'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { IndianRupee } from 'lucide-react';
import '@/styles/ag-theme-custom.css';


// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  type: string;
  isFree: boolean;
  price?: number;
  minTeamSize: number;
  maxTeamSize: number;
}

interface EventsTableProps {
  events: Event[];
  loading?: boolean;
}

export default function EventsTable({ events, loading = false }: EventsTableProps) {
  const router = useRouter();
  
  // Column Definitions with proper typing
  const [colDefs] = useState<Array<import('ag-grid-community').ColDef<Event>>>([
    { 
      field: 'title',
      headerName: 'Title',
      sortable: true,
      filter: true,
      flex: 2,
      cellStyle: { cursor: 'pointer' }
    },
    { 
      field: 'date',
      headerName: 'Date',
      valueFormatter: (params: any) => new Date(params.value).toLocaleDateString(),
      sortable: true,
      filter: true,
      width: 150,
      cellStyle: { cursor: 'pointer' }
    },
    { 
      field: 'location',
      headerName: 'Location',
      sortable: true,
      filter: true,
      flex: 1.5,
      cellStyle: { cursor: 'pointer' }
    },
    { 
      field: 'type',
      headerName: 'Type',
      sortable: true,
      filter: true,
      cellStyle: { cursor: 'pointer' }
    },
    { 
      field: 'minTeamSize',
      headerName: 'Team Size',
      valueGetter: (params) => {
        if (!params.data) return '';
        const minTeamSize = params.data.minTeamSize;
        const maxTeamSize = params.data.maxTeamSize;
        return minTeamSize === maxTeamSize ? minTeamSize : `${minTeamSize}-${maxTeamSize}`;
      },
      sortable: true,
      filter: true,
      width: 120,
      cellStyle: { cursor: 'pointer' }
    },
    {
      field: 'price',
      headerName: 'Price',
      cellRenderer: (params: import('ag-grid-community').ICellRendererParams<Event>) => {
        if (!params.data) return null;
        if (params.data.isFree) return 'Free';
        return (
          <div className="flex items-center">
            <IndianRupee className="h-4 w-4 mr-1" />
            {params.data.price}
          </div>
        );
      },
      sortable: true,
      filter: true,
      width: 120,
      cellStyle: { cursor: 'pointer' }
    }
  ]);

  // Default column definitions
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  // Handle row click
  const onRowClicked = (params: any) => {
    router.push(`/events/${params.data._id}`);
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="ag-theme-quartz h-full w-full" style={{ minHeight: '500px' }}>
      <AgGridReact
        rowData={events}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        onRowClicked={onRowClicked}
        pagination={false}
        rowSelection='single'
        animateRows={true}
        domLayout='autoHeight'
      />
    </div>
  );
}
