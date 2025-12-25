import { useState, useRef } from 'react';

export default function Settings() {
  // Admin profile state (local only)
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '', // Will store image URL (data URL)
    password: '',
  });
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(profile);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  // Handle input changes
  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Handle avatar upload
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((f) => ({ ...f, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes
  const handleSave = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      setMessage('Name and email are required.');
      return;
    }
    setProfile({ ...form, password: '' });
    setEdit(false);
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 2000);
  };

  // Cancel edit
  const handleCancel = () => {
    setEdit(false);
    setForm(profile);
    setMessage('');
  };

  // Show avatar: uploaded image or initials fallback
  const renderAvatar = () => {
    if (form.avatar) {
      return (
        <img
          src={form.avatar}
          alt="Profile"
          className="w-24 h-24 rounded-full object-cover border border-border"
        />
      );
    }
    // Fallback: initials
    const initials = form.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return (
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-3xl font-bold text-primary border border-border">
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Admin Profile Panel */}
      <div className="bg-card border border-border rounded-lg p-8 flex flex-col md:flex-row items-center md:items-start gap-6 max-w-2xl mx-auto">
        <div className="flex flex-col items-center md:items-start">
          <div className="mb-4 relative group flex flex-col items-center">
            <div className="border-4 border-primary shadow-lg rounded-full p-1 bg-background">
              {renderAvatar()}
            </div>
            {edit && (
              <>
                <button
                  type="button"
                  className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-md hover:bg-primary/90 focus:outline-none"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  title="Change profile picture"
                  style={{ zIndex: 2 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
                </button>
                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-muted text-foreground rounded hover:bg-muted/80 text-xs border border-border"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  Change Photo
                </button>
                <button
                  type="button"
                  className="mt-2 px-3 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 text-xs border border-border"
                  onClick={() => setForm((f) => ({ ...f, avatar: '' }))}
                >
                  Remove Photo
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
                <span className="text-xs text-muted-foreground mt-1">JPG, PNG, or GIF. Max 2MB.</span>
              </>
            )}
          </div>
          {!edit ? (
            <>
              <div className="text-xl font-semibold text-foreground">{profile.name}</div>
              <div className="text-muted-foreground mb-2">{profile.email}</div>
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                onClick={() => { setEdit(true); setForm(profile); setMessage(''); }}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-3 w-full max-w-xs">
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
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInput}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  placeholder="New password (optional)"
                />
              </div>
              {message && <div className="text-green-600 text-sm">{message}</div>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors text-sm"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

   
    </div>
  );
}