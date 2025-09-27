import React, { useState } from 'react';

const AddUserForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      password += charset.charAt(Math.floor(Math.random() * n));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const newPassword = generatePassword();

    try {
      const response = await fetch(`${import.meta.env.VITE_SCRIPT_URL}?path=addUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: JSON.stringify({ username, name, email, phoneNo, password: newPassword }),
        redirect: 'follow'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUserDetails({ username, name, email, phoneNo, password: newPassword });
        } else {
          setError(data.error || 'Failed to add user');
        }
      } else {
        setError('Failed to add user');
      }
    } catch (err) {
      setError('An error occurred while adding the user');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setUserDetails(null);
    setUsername('');
    setName('');
    setEmail('');
    setPhoneNo('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Add New User</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {userDetails ? (
            <div className="space-y-6">
              <p className="text-center text-green-600 font-semibold">User added successfully!</p>
              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-medium text-gray-500">Username</div>
                  <div className="col-span-2 text-gray-900">{userDetails.username}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-medium text-gray-500">Name</div>
                  <div className="col-span-2 text-gray-900">{userDetails.name}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-medium text-gray-500">Email</div>
                  <div className="col-span-2 text-gray-900">{userDetails.email}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-medium text-gray-500">Phone No.</div>
                  <div className="col-span-2 text-gray-900">{userDetails.phoneNo}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1 font-medium text-gray-500">Password</div>
                  <div className="col-span-2 text-gray-900 font-mono bg-gray-100 p-2 rounded">
                    {userDetails.password}
                  </div>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => copyToClipboard(`Username: ${userDetails.username}\nName: ${userDetails.name}\nEmail: ${userDetails.email}\nPhone Number: ${userDetails.phoneNo}\nPassword: ${userDetails.password}`)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {copied ? 'Copied!' : 'Copy All'}
                </button>
                <button
                  onClick={resetForm}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Another User
                </button>
              </div>
              <button
                onClick={onDone}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Done
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phoneNo" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phoneNo"
                    name="phoneNo"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phoneNo}
                    onChange={(e) => setPhoneNo(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {loading ? 'Adding User...' : 'Add User'}
                </button>
                <button
                  type="button"
                  onClick={onDone}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
};

export default AddUserForm;
