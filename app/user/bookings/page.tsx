'use client';

import { Card, CardBody, CardHeader, Nav, NavItem, NavLink, TabContainer, TabContent, TabPane } from 'react-bootstrap';
import { BsBriefcaseFill, BsPatchCheck, BsXOctagon } from 'react-icons/bs';
import UserLayout from '@/app/components/layouts/UserLayout';
import { UpcomingBooking, CancelledBooking, CompletedBooking } from '@/app/components';

const BookingsPage = () => {
  return (
    <UserLayout>
      <Card className="border bg-transparent">
        <CardHeader className="bg-transparent border-bottom">
          <h4 className="card-header-title text-dark">My Bookings</h4>
        </CardHeader>

        <CardBody className="p-0">
          <TabContainer defaultActiveKey="1">
            <Nav className="nav nav-tabs nav-bottom-line nav-responsive nav-justified border-0">
              <NavItem>
                <NavLink eventKey="1" className="mb-0 flex-centered py-3">
                  <BsBriefcaseFill className=" fa-fw me-1" />
                  Upcoming Booking
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink eventKey="2" className="mb-0 flex-centered py-3">
                  <BsXOctagon className=" fa-fw me-1" />
                  Canceled Booking
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink eventKey="3" className="mb-0 flex-centered py-3">
                  <BsPatchCheck className=" fa-fw me-1" />
                  Completed Booking
                </NavLink>
              </NavItem>
            </Nav>

            <TabContent className="p-2 p-sm-4" id="nav-tabContent">
              <TabPane eventKey="1" className="fade">
                <UpcomingBooking />
              </TabPane>

              <TabPane eventKey="2" className="fade">
                <CancelledBooking />
              </TabPane>

              <TabPane eventKey="3" className="fade" id="tab-3">
                <CompletedBooking />
              </TabPane>
            </TabContent>
          </TabContainer>
        </CardBody>
      </Card>
    </UserLayout>
  );
};

export default BookingsPage;
