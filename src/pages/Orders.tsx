import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { format } from 'date-fns';
import { useMutation } from '@tanstack/react-query';

export default function Orders() {
  const [status, setStatus] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['orders', status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: '1', limit: '20' });
      if (status !== 'all') params.append('status', status);
      const response = await api.get(`/admin/orders?${params}`);
      return response.data;
    },
  });
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const fetchOrderDetails = async (id: string) => {
    const resp = await api.get(`/admin/orders/${id}`);
    return resp.data;
  };

  const resendMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/orders/${id}/resend`),
    onSuccess: () => {
      // noop
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: any) => api.put(`/admin/orders/${id}`, { status }),
    onSuccess: () => {
      // refresh list
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedOrderId(null);
      setOrderDetails(null);
    },
  });

  const openOrder = async (id: string) => {
    setSelectedOrderId(id);
    try {
      const details = await fetchOrderDetails(id);
      setOrderDetails(details);
    } catch (err) {
      setOrderDetails(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input w-48"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <div className="card">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {data?.orders?.length > 0 ? (
                  data.orders.map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => openOrder(order.id)}>
                      <td className="py-3 px-4 font-mono text-sm">
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4">{order.user?.email || 'N/A'}</td>
                      <td className="py-3 px-4">{order.items?.length || 0}</td>
                      <td className="py-3 px-4 font-medium">
                        ₹{(order.total_cents / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            order.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {format(new Date(order.created_at), 'MMM dd, yyyy')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrderId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order Details</h3>
              <button onClick={() => { setSelectedOrderId(null); setOrderDetails(null); }} className="p-2">Close</button>
            </div>
            {orderDetails ? (
              <div>
                <p><strong>Order ID:</strong> {orderDetails.id}</p>
                <p><strong>Customer:</strong> {orderDetails.user_email}</p>
                <p className="mt-2"><strong>Items:</strong></p>
                <ul className="mb-4">
                  {orderDetails.items?.map((it: any) => (
                    <li key={it.design_id} className="flex justify-between">
                      <span>{it.design_title}</span>
                      <span>{(it.unit_price_cents/100).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2">
                  <button onClick={() => resendMutation.mutate(selectedOrderId)} className="btn btn-secondary">Resend Email</button>
                  <button onClick={() => updateStatusMutation.mutate({ id: selectedOrderId, status: 'paid' })} className="btn btn-primary">Mark Paid</button>
                  <button onClick={() => updateStatusMutation.mutate({ id: selectedOrderId, status: 'refunded' })} className="btn btn-danger">Mark Refunded</button>
                </div>
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
