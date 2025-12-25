import { useState, useRef } from 'react';
import { MoreVertical, Plus, X } from 'lucide-react';

const initialUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    status: 'Active',
    joinDate: 'Mar 22, 2023',
    orders: 12,
    avatar: 'JD'
  },
  {
    id: 2,
    name: 'Sarah Smith',
    email: 'sarah.smith@example.com',
    status: 'Active',
    joinDate: 'Mar 22, 2023',
    orders: 13,
    avatar: 'SS'
  },
  {
    id: 3,
    name: 'Michael Johnson',
    email: 'michael.j@example.com',
    status: 'Inactive',
    joinDate: 'Mar 22, 2023',
    orders: 5,
    avatar: 'MJ'
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    status: 'Active',
    joinDate: 'Apr 5, 2023',
    orders: 9,
    avatar: 'ED'
  }
];

const defaultProfile = {
  id: 0,
  name: '',
  email: '',
  location: '',
  bio: '',
  avatar: '',
  genres: [],
  joinDate: '',
  booksListed: 0,
  booksSold: 0,
  booksExchanged: 0,
};

export default function Users() {
  const [activeTab, setActiveTab] = useState('All Users');
  const tabs = ['All Users', 'Active', 'Inactive'];
  const [users, setUsers] = useState(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    status: 'Active',
    avatar: '',
  });
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(null); // user id
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(defaultProfile);
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(defaultProfile);
  const fileInputRef = useRef(null);

  // Filter users based on tab
  const filteredUsers =
    activeTab === 'All Users'
      ? users
      : users.filter((u) => u.status === activeTab);

  // Handle form input
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Handle add user
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.avatar) {
      setError('All fields are required.');
      return;
    }
    setUsers((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: form.name,
        email: form.email,
        status: form.status,
        joinDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        orders: 0,
        avatar: form.avatar,
        location: '',
        bio: '',
        genres: [],
        booksListed: 0,
        booksSold: 0,
        booksExchanged: 0,
      },
    ]);
    setForm({ name: '', email: '', status: 'Active', avatar: '' });
    setShowAddModal(false);
    setError('');
  };

  // Dropdown actions
  const handleDropdown = (user, action) => {
    setDropdownOpen(null);
    if (action === 'view') {
      setProfileUser({
        ...user,
        genres: user.genres || ['Fiction', 'Mystery', 'Science Fiction'],
        location: user.location || 'Unknown',
        bio: user.bio || '',
        joinDate: user.joinDate || 'Mar 22, 2023',
        booksListed: user.booksListed || 23,
        booksSold: user.booksSold || 18,
        booksExchanged: user.booksExchanged || 12,
        avatar: user.avatar || '',
      });
      setProfileForm({
        ...user,
        genres: user.genres || ['Fiction', 'Mystery', 'Science Fiction'],
        location: user.location || 'Unknown',
        bio: user.bio || '',
        joinDate: user.joinDate || 'Mar 22, 2023',
        booksListed: user.booksListed || 23,
        booksSold: user.booksSold || 18,
        booksExchanged: user.booksExchanged || 12,
        avatar: user.avatar || '',
      });
      setShowProfile(true);
      setEditProfile(false);
    } else if (action === 'remove') {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } else if (action === 'edit') {
      setProfileUser({
        ...user,
        genres: user.genres || ['Fiction', 'Mystery', 'Science Fiction'],
        location: user.location || 'Unknown',
        bio: user.bio || '',
        joinDate: user.joinDate || 'Mar 22, 2023',
        booksListed: user.booksListed || 23,
        booksSold: user.booksSold || 18,
        booksExchanged: user.booksExchanged || 12,
        avatar: user.avatar || '',
      });
      setProfileForm({
        ...user,
        genres: user.genres || ['Fiction', 'Mystery', 'Science Fiction'],
        location: user.location || 'Unknown',
        bio: user.bio || '',
        joinDate: user.joinDate || 'Mar 22, 2023',
        booksListed: user.booksListed || 23,
        booksSold: user.booksSold || 18,
        booksExchanged: user.booksExchanged || 12,
        avatar: user.avatar || '',
      });
      setShowProfile(true);
      setEditProfile(true);
    }
  };

  // Profile panel handlers
  const handleProfileInput = (e) => {
    const { name, value } = e.target;
    setProfileForm((f) => ({ ...f, [name]: value }));
  };
  const handleGenreToggle = (genre) => {
    setProfileForm((f) => ({
      ...f,
      genres: f.genres.includes(genre)
        ? f.genres.filter((g) => g !== genre)
        : [...f.genres, genre],
    }));
  };
  const handleProfileSave = (e) => {
    e.preventDefault();
    setUsers((prev) =>
      prev.map((u) =>
        u.id === profileUser.id ? { ...u, ...profileForm } : u
      )
    );
    setProfileUser(profileForm);
    setEditProfile(false);
  };
  const handleProfileCancel = () => {
    setEditProfile(false);
    setProfileForm(profileUser);
  };
  // Profile picture upload/remove
  const handleProfileAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm((f) => ({ ...f, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveAvatar = () => {
    setProfileForm((f) => ({ ...f, avatar: '' }));
  };

  // Genres for selection
  const allGenres = ['Fiction', 'Mystery', 'Science Fiction', 'Fantasy', 'Non-fiction', 'Biography', 'Romance'];

  return (
    <div className="space-y-6">
      {/* Add User Modal */}
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
            <h2 className="text-xl font-semibold mb-4">Add User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInput}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInput}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInput}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Avatar Initials</label>
                <input
                  type="text"
                  name="avatar"
                  value={form.avatar}
                  onChange={handleInput}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  maxLength={2}
                  required
                />
              </div>
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <button
                type="submit"
                className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
              >
                Add User
              </button>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-3 right-3 p-1 hover:bg-muted rounded"
              onClick={() => setShowProfile(false)}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-4">
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profileForm.avatar ? (
                      <img src={profileForm.avatar} alt="avatar" className="w-20 h-20 rounded-full object-cover border border-border" />
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center text-3xl font-bold text-muted-foreground border border-border">
                        {profileForm.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                    )}
                    {editProfile && (
                      <>
                        <button
                          type="button"
                          className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-2 shadow-md hover:bg-primary/90 focus:outline-none"
                          onClick={() => fileInputRef.current && fileInputRef.current.click()}
                          title="Change profile picture"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
                        </button>
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md hover:bg-destructive/90 focus:outline-none"
                          onClick={handleRemoveAvatar}
                          title="Remove profile picture"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleProfileAvatar}
                        />
                      </>
                    )}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{profileForm.name}</div>
                    <div className="text-muted-foreground text-sm">{profileForm.location}</div>
                    <div className="text-xs text-muted-foreground mt-1">4.8 (47 transactions)</div>
                  </div>
                </div>
                <button
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm self-start"
                  onClick={() => setEditProfile((e) => !e)}
                >
                  {editProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              {/* Overview Cards */}
              <div className="flex gap-4 my-2">
                <div className="flex-1 bg-muted rounded-lg p-4 flex flex-col items-center">
                  <div className="font-semibold text-lg">Books Listed</div>
                  <div className="text-2xl font-bold">{profileForm.booksListed}</div>
                </div>
                <div className="flex-1 bg-muted rounded-lg p-4 flex flex-col items-center">
                  <div className="font-semibold text-lg">Books Sold</div>
                  <div className="text-2xl font-bold">{profileForm.booksSold}</div>
                </div>
                <div className="flex-1 bg-muted rounded-lg p-4 flex flex-col items-center">
                  <div className="font-semibold text-lg">Books Exchanged</div>
                  <div className="text-2xl font-bold">{profileForm.booksExchanged}</div>
                </div>
              </div>
              {/* Info Sections */}
              <div className="flex flex-col md:flex-row gap-6 mt-2">
                {/* Personal Info */}
                <div className="flex-1 bg-background border border-border rounded-lg p-4">
                  <div className="font-bold text-lg mb-2">Personal Information</div>
                  <form onSubmit={handleProfileSave} className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileInput}
                        className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                        disabled={!editProfile}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileInput}
                        className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                        disabled={!editProfile}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={profileForm.location}
                        onChange={handleProfileInput}
                        className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                        disabled={!editProfile}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Bio</label>
                      <textarea
                        name="bio"
                        value={profileForm.bio}
                        onChange={handleProfileInput}
                        className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                        disabled={!editProfile}
                        rows={2}
                      />
                    </div>
                    {editProfile && (
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors text-sm"
                          onClick={handleProfileCancel}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
                {/* Reading Preferences */}
                <div className="flex-1 bg-background border border-border rounded-lg p-4">
                  <div className="font-bold text-lg mb-2">Reading Preferences</div>
                  <div className="mb-2">
                    <div className="font-medium text-sm mb-1">Favorite Genres</div>
                    <div className="flex flex-wrap gap-2">
                      {allGenres.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          className={`px-3 py-1 rounded-full border text-xs ${profileForm.genres.includes(genre) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border'}`}
                          onClick={() => editProfile && handleGenreToggle(genre)}
                          disabled={!editProfile}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="font-medium text-sm">Member Since</span>
                    <div className="text-sm text-muted-foreground">{profileForm.joinDate}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <div className="mt-2">
            <h2 className="text-xl font-semibold text-foreground">User Management</h2>
            <p className="text-muted-foreground">Manage your users and their permissions</p>
          </div>
        </div>
        <button
          className="flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
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
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-muted-foreground">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary font-medium text-sm">{user.avatar}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'Active'
                          ? 'bg-success/10 text-success'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {user.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {user.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground relative">
                      <button
                        className="p-1 hover:bg-muted rounded-md"
                        onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                        aria-label="Actions"
                        type="button"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {dropdownOpen === user.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-card border border-border rounded-md shadow-lg z-10">
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
                            onClick={() => handleDropdown(user, 'view')}
                          >
                            View Profile
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-muted text-sm"
                            onClick={() => handleDropdown(user, 'edit')}
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-muted text-sm text-destructive"
                            onClick={() => handleDropdown(user, 'remove')}
                          >
                            Remove
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