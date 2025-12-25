import { useState } from 'react';
import { Plus, Search, MoreVertical, ChevronDown, X } from 'lucide-react';

const initialDonations = [
  {
    id: 1,
    organization: "Children's HomeMay",
    requestDate: '10, 2023',
    booksRequested: 'Educational, Fiction',
    quantity: '25-30',
    priority: 'High',
    status: 'Pending'
  },
  {
    id: 2,
    organization: 'Sunshine OrphanageMay',
    requestDate: '15, 2023',
    booksRequested: 'Fiction, Fantasy',
    quantity: '15-20',
    priority: 'Medium',
    status: 'Approved'
  },
  {
    id: 3,
    organization: 'Little Angels Care CenterMay',
    requestDate: '18, 2023',
    booksRequested: 'Picture Books',
    quantity: '10-15',
    priority: 'Medium',
    status: 'Fulfilled'
  },
  {
    id: 4,
    organization: 'New Beginnings ShelterMay',
    requestDate: '20, 2023',
    booksRequested: 'Educational',
    quantity: '20-25',
    priority: 'High',
    status: 'Pending'
  }
];

export default function Donation() {
  const [activeTab, setActiveTab] = useState('All Request');
  const [searchTerm, setSearchTerm] = useState('');
  const tabs = ['All Request', 'Pending', 'Approved', 'Fulfilled'];
  const [donations, setDonations] = useState(initialDonations);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    organization: '',
    requestDate: '',
    booksRequested: '',
    quantity: '',
    priority: 'Medium',
    status: 'Pending',
  });
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null); // donation id for open dropdown

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-destructive/10 text-destructive';
      case 'Medium':
        return 'bg-warning/10 text-orange-600';
      case 'Low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-success/10 text-success';
      case 'Pending':
        return 'bg-warning/10 text-orange-600';
      case 'Fulfilled':
        return 'bg-info/10 text-blue-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  // Filter donations by tab and search
  const filteredDonations = donations.filter((donation) => {
    const matchesTab =
      activeTab === 'All Request' ? true : donation.status === activeTab;
    const matchesSearch =
      donation.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.booksRequested.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Handle form input
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Handle add donation
  const handleAddDonation = (e) => {
    e.preventDefault();
    if (!form.organization || !form.requestDate || !form.booksRequested || !form.quantity) {
      setError('All fields are required.');
      return;
    }
    setDonations((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        ...form,
      },
    ]);
    setForm({ organization: '', requestDate: '', booksRequested: '', quantity: '', priority: 'Medium', status: 'Pending' });
    setShowAddModal(false);
    setError('');
  };

  // Handle status change from dropdown
  const handleStatusChange = (id, status) => {
    setDonations((prev) =>
      prev.map((donation) =>
        donation.id === id ? { ...donation, status } : donation
      )
    );
    setDropdownOpen(null);
  };

  return (
    <div className="space-y-6">
      {/* Add Donation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 p-1 hover:bg-muted rounded"
              onClick={() => { setShowAddModal(false); setError(''); }}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Add Donation Request</h2>
            <form onSubmit={handleAddDonation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={form.organization}
                  onChange={handleInput}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Request Date</label>
                <input
                  type="text"
                  name="requestDate"
                  value={form.requestDate}
                  onChange={handleInput}
                  placeholder="e.g. 25, 2023"
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Books Requested</label>
                <input
                  type="text"
                  name="booksRequested"
                  value={form.booksRequested}
                  onChange={handleInput}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="text"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleInput}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleInput}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInput}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Fulfilled">Fulfilled</option>
                </select>
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Add Donation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Donation Books Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage donation requests from orphanages and charitable organizations
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
            />
          </div>
          <button
            className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Donations
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Donations Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Request Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Books Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">No donations found.</td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">
                        {donation.organization}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {donation.requestDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {donation.booksRequested}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {donation.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(donation.priority)}`}>
                        {donation.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground relative">
                      <button
                        className="flex items-center p-1 hover:bg-muted rounded-md"
                        onClick={() => setDropdownOpen(dropdownOpen === donation.id ? null : donation.id)}
                        aria-label="Actions"
                        type="button"
                      >
                        <MoreVertical className="w-4 h-4" />
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                      {dropdownOpen === donation.id && (
                        <div className="absolute right-0 mt-2 w-36 bg-card border border-border rounded-md shadow-lg z-10">
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
                            onClick={() => handleStatusChange(donation.id, 'Pending')}
                          >
                            Pending
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
                            onClick={() => handleStatusChange(donation.id, 'Approved')}
                          >
                            Approved
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
                            onClick={() => handleStatusChange(donation.id, 'Fulfilled')}
                          >
                            Fulfilled
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}