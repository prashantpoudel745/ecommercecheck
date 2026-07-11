
export const getEmployeeId = (): string => {
  const authWindow = window as Window & { __AUTH_USER__?: { id?: string; _id?: string } };
  const authUser = authWindow.__AUTH_USER__;

  if (!authUser?.id && !authUser?._id) {
    throw new Error('No authenticated user available in memory');
  }

  return authUser.id || authUser._id || '';
};

export const getAuthToken = (): string => {
  throw new Error('JWT is stored in an HttpOnly cookie and is not accessible from JavaScript');
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