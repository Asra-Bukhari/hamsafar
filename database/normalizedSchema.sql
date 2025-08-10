create database carpoolingManagement;
Go
use carpoolingManagement;
Go

-- 1. Areas Table (Already in BCNF)
CREATE TABLE Areas(
    AreaCode int PRIMARY KEY,
    City varchar(500) NOT NULL,
    Town varchar(500),
    Road varchar(500) DEFAULT NULL,
    Block int DEFAULT NULL,
    sector varchar(500) DEFAULT NULL,
    Place varchar(500),
    latitude float,
    longitude float
);
Go

-- 2. Vehicles Table (Already in BCNF)
CREATE TABLE Vehicles(
    vehicleID int IDENTITY(1,1) PRIMARY KEY,
    Name varchar(20) NOT NULL,
    Color varchar(10) NOT NULL,
    Company varchar(15) NOT NULL,
    Typee varchar(10) CHECK (Typee IN ('Mini','Luxury','Comfort','Rickshaw','Bike')),
    Capacity int NOT NULL 
);
Go

-- 3. Users Table (Already in BCNF)
CREATE TABLE Users(
    userID int IDENTITY(1,1) PRIMARY KEY,
    Name varchar(150) DEFAULT 'Unknown',
    Email varchar(255) UNIQUE NOT NULL CHECK(Email like '%@email.com' or Email like '%@gmail.com'),
    Password varchar(255) NOT NULL,
    Gender varchar(7) CHECK (Gender IN ('Male','Female')),
    Age int CHECK (Age >= 18),
    City varchar(20) NOT NULL,
    UserStatus varchar(10) CHECK (UserStatus IN ('Driver','Non-Driver')),
    Contact varchar(12) NOT NULL,
    EmergencyContact varchar(12) NOT NULL,
    CurrentArea int,
    Preference1 int,
    Preference2 int,
    Preference3 int,
    RecentTrip int,
    IsActive bit DEFAULT 1,
    isAdmin int default 0,
    FOREIGN KEY (CurrentArea) REFERENCES Areas(AreaCode) ON DELETE CASCADE,
    FOREIGN KEY (Preference1) REFERENCES Areas(AreaCode),
    FOREIGN KEY (Preference2) REFERENCES Areas(AreaCode),
    FOREIGN KEY (Preference3) REFERENCES Areas(AreaCode),
    FOREIGN KEY (RecentTrip) REFERENCES Areas(AreaCode)
);
Go

-- 4. Drivers Table (Already in BCNF)
CREATE TABLE Drivers(
    driverID int PRIMARY KEY FOREIGN KEY REFERENCES Users(userID) ON DELETE CASCADE,
    vehicleID int,
    DriverStatus varchar(12) CHECK (DriverStatus IN ('Hired','Collaborator')),
    Availability varchar(3) NOT NULL CHECK (Availability IN ('Yes','No')),
    FOREIGN KEY (vehicleID) REFERENCES Vehicles(vehicleID) ON DELETE CASCADE
);
Go

-- 5. ScheduledTrips (Split to maintain BCNF)
CREATE TABLE ScheduledTrips (
    TripID INT IDENTITY(1,1) CONSTRAINT tripID_pk PRIMARY KEY,
    DriverID INT NOT NULL,
	RequesterID INT NOT NULL,
    StartLocation INT NOT NULL,
    Destination INT NOT NULL,
    Statuss VARCHAR(12) CHECK (Statuss IN ('Scheduled','Ongoing', 'Cancelled', 'Completed')),
    CurrentLocation INT,
    ExpectedDuration INT,
    DepartureTime DATETIME,
    CONSTRAINT requesterID_fk FOREIGN KEY (RequesterID) REFERENCES Users(userID) ON DELETE CASCADE,
    CONSTRAINT driverID_fk FOREIGN KEY (DriverID) REFERENCES Drivers(driverID) ON DELETE NO ACTION,
    CONSTRAINT startLocation_fk FOREIGN KEY (StartLocation) REFERENCES Areas(AreaCode) ON DELETE NO ACTION,
    CONSTRAINT destination_fk FOREIGN KEY (Destination) REFERENCES Areas(AreaCode) ON DELETE NO ACTION,
    CONSTRAINT currentLocation_fk FOREIGN KEY (CurrentLocation) REFERENCES Areas(AreaCode) ON DELETE NO ACTION
);
Go

CREATE TABLE ScheduledTripPassengers (    --removed atomicity
    TripID INT,
    PassengerID INT,

    CONSTRAINT stp_trip_fk FOREIGN KEY (TripID) REFERENCES ScheduledTrips(TripID),
    CONSTRAINT stp_passenger_fk FOREIGN KEY (PassengerID) REFERENCES Users(userID) ,
    CONSTRAINT stp_pk PRIMARY KEY (TripID, PassengerID)
);
Go

CREATE TABLE SeatsInfo(       --fixed update anomaly
    TripID int PRIMARY KEY,
    AvailableSeats int,
    FOREIGN KEY (TripID) REFERENCES ScheduledTrips(TripID) ON DELETE CASCADE
);
Go

-- 6. Payments Table (Removed DriverID to fix redundancy issue - can get it through join on scheduledtrips)
CREATE TABLE Payments (
    PaymentID INT IDENTITY(1,1) CONSTRAINT paymentID_pk PRIMARY KEY,
    TripID INT NOT NULL,
    EarnedAmount INT NOT NULL,
    Statuss VARCHAR(6) CHECK (Statuss IN ('Paid', 'Unpaid')),
    PaymentDate DATE DEFAULT NULL,
    CONSTRAINT tripID_fk FOREIGN KEY (TripID) REFERENCES ScheduledTrips(TripID) ON DELETE CASCADE
);
Go

-- 7. Friends Group Table (Decomposed)
CREATE TABLE FriendsGroup (
    GroupNo INT IDENTITY(1,1) CONSTRAINT group_pk PRIMARY KEY,
    groupAdmin INT NOT NULL,      --here groupadmin means the user who created the group so no need to split
    TripsCompleted INT DEFAULT NULL,
    CONSTRAINT admin_fk FOREIGN KEY (groupAdmin) REFERENCES Users(userID) ON DELETE CASCADE
);
Go

CREATE TABLE GroupMembers (
    GroupNo INT,
    MemberID INT,
    CONSTRAINT group_member_pk PRIMARY KEY (GroupNo, MemberID),
    CONSTRAINT gm_group_fk FOREIGN KEY (GroupNo) REFERENCES FriendsGroup(GroupNo),
    CONSTRAINT gm_user_fk FOREIGN KEY (MemberID) REFERENCES Users(userID) 
);
Go


-- 8. TripRequests (Already in BCNF)
CREATE TABLE TripRequests (
    RequestID int IDENTITY(1,1) PRIMARY KEY,
    PassengerID int NOT NULL,
    PickupLocation int NOT NULL,
    DropoffLocation int NOT NULL,
    TripDateTime datetime NOT NULL,
    Statuss varchar(50) DEFAULT 'Pending' CHECK (Statuss IN ('approved','Pending')),
    CreatedAt datetime DEFAULT GETDATE(),
    FOREIGN KEY (PassengerID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (PickupLocation) REFERENCES Areas(AreaCode),
    FOREIGN KEY (DropoffLocation) REFERENCES Areas(AreaCode)
);
Go

-- 9. JoinRequests (Already in BCNF)
CREATE TABLE JoinRequests (
    JoinRequestID int IDENTITY(1,1) PRIMARY KEY,
    TripRequestID int FOREIGN KEY REFERENCES TripRequests(RequestID),
    PassengerID int FOREIGN KEY REFERENCES Users(UserID),
    Status varchar(50) DEFAULT 'Pending' CHECK (Status IN ('Approved','Pending','Rejected')),  
);
Go

-- 10. Ratings Table (Fixed to Composite Key)
CREATE TABLE Ratings (
    TripID int NOT NULL,
    PassengerID int NOT NULL,
    DriverID int NOT NULL,
    Rating int CHECK (Rating BETWEEN 1 AND 5),
    Review text NULL,
    RatedAt datetime DEFAULT GETDATE(),
    PRIMARY KEY (TripID, PassengerID),
    FOREIGN KEY (TripID) REFERENCES ScheduledTrips(TripID) ON DELETE CASCADE,
    FOREIGN KEY (PassengerID) REFERENCES Users(userID),
    FOREIGN KEY (DriverID) REFERENCES Users(userID)
);
Go

-- 11. Notifications (Already in BCNF)
CREATE TABLE Notifications (
    NotificationID int IDENTITY(1,1) PRIMARY KEY,
    UserID int NOT NULL,
    TripID int NULL,
    Message varchar(500) NOT NULL,
    IsRead bit DEFAULT 0,
    CreatedAt datetime DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(userID) ON DELETE CASCADE,
    FOREIGN KEY (TripID) REFERENCES ScheduledTrips(TripID)
);
Go