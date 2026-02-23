'use client';

import { BsCheckCircleFill, BsCircle } from 'react-icons/bs';
import Link from 'next/link';
import { useLayoutContext } from '@/app/states';

interface CheckItem {
  label: string;
  done: boolean;
  href: string;
}

const ProfileProgress = () => {
  const { account: profile, isAccountLoading: isLoading } = useLayoutContext();

  if (isLoading || !profile) return null;

  const checks: CheckItem[] = [
    { label: 'Verified Email', done: !!profile?.email_verified, href: '/user/settings' },
    { label: 'Verified Mobile', done: !!profile?.phone_verified, href: '/user/profile' },
    { label: 'Profile Photo', done: !!profile?.avatar_url, href: '/user/settings' },
    { label: 'Date of Birth', done: !!profile?.date_of_birth, href: '/user/settings' },
    { label: 'Gender', done: !!profile?.gender, href: '/user/settings' },
    { label: 'Address', done: !!profile?.address, href: '/user/settings' },
  ];

  const doneCount = checks.filter((c) => c.done).length;
  const pct = isLoading ? 0 : Math.round((doneCount / checks.length) * 100);

  const barColor = pct === 100 ? 'bg-success' : pct >= 50 ? 'bg-primary' : 'bg-warning';

  return (
    <div className="bg-light rounded p-3">
      <div className="overflow-hidden">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <h6 className="mb-0">Complete Your Profile</h6>
          <span className="small fw-semibold">{isLoading ? '…' : `${pct}%`}</span>
        </div>
        <div className="progress progress-sm bg-success bg-opacity-10 mb-2">
          <div
            className={`progress-bar ${barColor}`}
            role="progressbar"
            style={{ width: `${pct}%`, transition: 'width 0.6s ease' }}
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="mb-0 small text-secondary">
          {pct === 100
            ? 'Your profile is complete! 🎉'
            : `${checks.length - doneCount} item${checks.length - doneCount !== 1 ? 's' : ''} left — complete your profile to get the best experience.`}
        </p>
      </div>

      <div className="bg-body rounded p-3 mt-3">
        <ul className="list-inline hstack flex-wrap gap-3 mb-0">
          {checks.map((item) => (
            <li key={item.label} className="list-inline-item h6 fw-normal mb-0">
              <Link href={item.href} className={`items-center d-flex ${item.done ? '' : 'text-primary'}`}>
                {item.done
                  ? <BsCheckCircleFill className="text-success me-2 flex-shrink-0" />
                  : <BsCircle className="text-secondary me-2 flex-shrink-0 opacity-50" />
                }
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileProgress;
