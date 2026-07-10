
export const getEmployeeId = (): string => {
  const employee = localStorage.getItem('user');
  if (!employee) {
    throw new Error('No user found in localStorage');
  }
  try {
    const parsed = JSON.parse(employee);
    if (!parsed.id) {
      throw new Error('Invalid user data: missing id');
    }
    return parsed.id;
  } catch (error) {
    throw new Error('Failed to parse user data from localStorage');
  }
};

export const getAuthToken = (): string => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No auth token found in localStorage');
  }
  return token;
};

export const formatDuration = (checkIn: string, checkOut?: string): string => {
  if (!checkOut) return '-';
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'present': return 'text-green-700 bg-green-100';
    case 'late': return 'text-yellow-700 bg-yellow-100';
    case 'overtime': return 'text-purple-700 bg-purple-100';
    case 'half-day': return 'text-blue-700 bg-blue-100';
    default: return 'text-gray-700 bg-gray-100';
  }
};

export const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatTime = (time: string): string => {
  return new Date(time).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });
};