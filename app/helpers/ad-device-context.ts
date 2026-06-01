export type AdDeviceContext = {
  platform: string;
  os: string;
  device_type: string;
};

export function getAdDeviceContext(): AdDeviceContext {
  if (typeof navigator === 'undefined') {
    return { platform: 'web', os: 'Unknown', device_type: 'unknown' };
  }

  const ua = navigator.userAgent;
  const isTablet = /iPad|Tablet|Kindle|Silk/i.test(ua);
  const isMobile = /Mobi|Android/i.test(ua) && !isTablet;

  let os = 'Unknown';
  if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua)) os = 'macOS';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return {
    platform: 'web',
    os,
    device_type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
  };
}
