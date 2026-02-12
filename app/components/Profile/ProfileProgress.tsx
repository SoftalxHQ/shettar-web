'use client';

import { BsCheckCircleFill, BsPlusCircleFill } from 'react-icons/bs';
import Link from 'next/link';

const ProfileProgress = () => {
  return (
    <div className="bg-light rounded p-3">
      <div className="overflow-hidden">
        <h6 className="text-dark">Complete Your Profile</h6>
        <div className="progress progress-sm bg-success bg-opacity-10">
          <div
            className="progress-bar bg-success"
            role="progressbar"
            style={{ width: '85%' }}
            aria-valuenow={85}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span className="progress-percent-simple h6 fw-light ms-auto">85%</span>
          </div>
        </div>
        <p className="mb-0 text-dark">Get the best out of booking by adding the remaining details!</p>
      </div>

      <div className="bg-body rounded p-3 mt-3">
        <ul className="list-inline hstack flex-wrap gap-2 justify-content-between mb-0">
          <li className="list-inline-item h6 fw-normal mb-0">
            <Link href="" className="items-center text-dark d-flex">
              <BsCheckCircleFill className=" text-success me-2" />
              Verified Email
            </Link>
          </li>
          <li className="list-inline-item h6 fw-normal mb-0">
            <Link href="" className="items-center text-dark d-flex">
              <BsCheckCircleFill className=" text-success me-2" />
              Verified Mobile Number
            </Link>
          </li>
          <li className="list-inline-item h6 fw-normal mb-0">
            <Link href="" className="text-primary items-center d-flex">
              <BsPlusCircleFill className=" me-2" />
              Complete Basic Info
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProfileProgress;
