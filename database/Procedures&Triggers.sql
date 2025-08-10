create database carpoolmanagementsystem
use carpoolmanagementsystem


/***********************
  1. Areas Table
***********************/
CREATE TABLE Areas(
    AreaCode int PRIMARY KEY,
    City varchar(20) NOT NULL,
    Society_TownName varchar(100) ,
    RoadName varchar(100) DEFAULT NULL,
    Blockk int DEFAULT NULL,
    sector varchar(4) DEFAULT NULL,
    House_Organization varchar(100) ,
    NearbyAreas Text,
	latitude float,
    longitude float,
	 UNIQUE(AreaCode)
);
GO

/***********************
  2. Vehicles Table
***********************/
CREATE TABLE Vehicles(
    vehicleID int IDENTITY(1,1) PRIMARY KEY,
    Name varchar(20) NOT NULL,
    Color varchar(10) NOT NULL,
    Company varchar(15) NOT NULL,
    Typee varchar(10) CHECK (Typee IN ('Mini','Luxury','Comfort','Rickshaw','Bike')),
    Capacity int NOT NULL 
);
GO

/***********************
  3. Users Table
***********************/
CREATE TABLE Users(
    userID int IDENTITY(1,1) constraint userID_pk PRIMARY KEY,
    Name varchar(150) DEFAULT 'Unknown',
    Email varchar(255) UNIQUE NOT NULL check(Email like '%@email.com' or Email like '%@gmail.com'),
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
	isAdmin int default 0 ,--for users
    CONSTRAINT CA_Fk FOREIGN KEY (CurrentArea) REFERENCES Areas(AreaCode) ON DELETE CASCADE,
    CONSTRAINT p1_Fk FOREIGN KEY (Preference1) REFERENCES Areas(AreaCode) ON DELETE NO ACTION,
    CONSTRAINT p2_Fk FOREIGN KEY (Preference2) REFERENCES Areas(AreaCode) ON DELETE NO ACTION,
    CONSTRAINT p3_Fk FOREIGN KEY (Preference3) REFERENCES Areas(AreaCode) ON DELETE NO ACTION,
    CONSTRAINT Rt_Fk FOREIGN KEY (RecentTrip) REFERENCES Areas(AreaCode) ON DELETE NO ACTION
);
GO

/***********************
  4. Drivers Table
***********************/
CREATE TABLE Drivers(
    driverID int PRIMARY KEY 
         CONSTRAINT driverID_fk FOREIGN KEY REFERENCES Users(userID) ON DELETE CASCADE,
    vehicleID int,
    DriverStatus varchar(12) CHECK (DriverStatus IN ('Hired','Collaborator')),
    Availability varchar(3) NOT NULL CHECK (Availability IN ('Yes','No')),
   
    CONSTRAINT vehID_Fk FOREIGN KEY (vehicleID) REFERENCES Vehicles(vehicleID) ON DELETE CASCADE
);
GO

/**************************
  5. Scheduled Trips Table
**************************/
CREATE TABLE ScheduledTrips(
    TripID int IDENTITY(1,1) constraint tripID_pk PRIMARY KEY,
    RequesterID int,
    AvailableSeats int DEFAULT -1,  -- if requester is not a driver 
    DriverID int DEFAULT NULL,
    StartLocation int,
    Destination int,
    Statuss varchar(12) CHECK (Statuss IN ('Ongoing','Cancelled','Completed')),
    Routee text,
    CurrentLocation int,
    ExpectedDuration int,
    DepartureTime date,
    Travelers text,
    CONSTRAINT requesterID_fk FOREIGN KEY (RequesterID) REFERENCES Users(userID) ON DELETE CASCADE,
    CONSTRAINT dID_fk FOREIGN KEY (DriverID) REFERENCES Drivers(driverID) ON DELETE No action,
    CONSTRAINT start_fk FOREIGN KEY (StartLocation) REFERENCES Areas(AreaCode) ON DELETE no action,
    CONSTRAINT dest_fk FOREIGN KEY (Destination) REFERENCES Areas(AreaCode) ON delete no action,
    CONSTRAINT curr_fk FOREIGN KEY (CurrentLocation) REFERENCES Areas(AreaCode) ON DELETE no action
);
GO

/***********************
  6. Payments Table
***********************/
CREATE TABLE Payments(
    PaymentID int IDENTITY(1,1) constraint paymentID_pk PRIMARY KEY,
    TripID int,
    DriverID int,
    EarnedAmount int,
    Statuss varchar(6) CHECK (Statuss IN ('Paid','Unpaid')),
    PaymentDate date DEFAULT NULL,
    CONSTRAINT tripID_fk FOREIGN KEY (TripID) REFERENCES ScheduledTrips(TripID) ON DELETE CASCADE,
    CONSTRAINT driverID_fk2 FOREIGN KEY (DriverID) REFERENCES Drivers(driverID) ON DELETE no action
);
GO

/*************************
  7. Friends Group Table
*************************/
CREATE TABLE FriendsGroup(
    GroupNo int IDENTITY(1,1) constraint group_pk PRIMARY KEY,
    groupAdmin int,
    TotalMembers int CHECK (TotalMembers <= 4),
    TripsCompleted int DEFAULT NULL,
    OtherMembers text,
    CONSTRAINT admin_fk FOREIGN KEY (groupAdmin) REFERENCES Users(userID) ON DELETE CASCADE
);
GO

/*************************
  8. Trips Requests Table
*************************/
CREATE TABLE TripRequests (
    RequestID int IDENTITY(1,1) constraint tr_pk PRIMARY KEY,
    PassengerID int NOT NULL,
    PickupLocation varchar(255) NOT NULL,
    DropoffLocation varchar(255) NOT NULL,
    TripDateTime datetime NOT NULL,
    Statuss varchar(50) DEFAULT 'Pending' CHECK (Statuss IN ('approved','Pending')),
    CreatedAt datetime DEFAULT GETDATE(),
    CONSTRAINT tr_fk FOREIGN KEY (PassengerID) REFERENCES Users(userID) ON DELETE CASCADE
);
GO

/*************************
  9. Ratings Table
*************************/
CREATE TABLE Ratings (
    RatingID int IDENTITY(1,1) PRIMARY KEY,
    TripID int NOT NULL,
	PassengerID int NOT NULL,
    DriverID int NOT NULL,
    Rating int CHECK (Rating BETWEEN 1 AND 5),
    Review text NULL,
    RatedAt datetime DEFAULT GETDATE(),
    CONSTRAINT trip_fk FOREIGN KEY (TripID) REFERENCES ScheduledTrips(TripID) ON DELETE CASCADE,
	CONSTRAINT rating_pass_fk FOREIGN KEY (PassengerID) REFERENCES Users(userID) ON DELETE no action,
    CONSTRAINT rating_driver_fk FOREIGN KEY (DriverID) REFERENCES Users(userID) ON DELETE no action
);
GO

/*************************
 10. Notifications Table
*************************/
CREATE TABLE Notifications (
    NotificationID int IDENTITY(1,1) PRIMARY KEY,
    UserID int NOT NULL,
    TripID int NULL,
    Message varchar(500) NOT NULL,
    IsRead bit DEFAULT 0,
    CreatedAt datetime DEFAULT GETDATE(),
    CONSTRAINT notif_user_fk FOREIGN KEY (UserID) REFERENCES Users(userID) ON DELETE CASCADE,
    CONSTRAINT notif_trip_fk FOREIGN KEY (TripID) REFERENCES ScheduledTrips(TripID) ON DELETE NO ACTION
);




Go


/*****************************
  Triggers for Cascade Deletes
*****************************/

-- Trigger on Areas: Cascade delete to Users and ScheduledTrips that reference deleted Areas.
CREATE TRIGGER trg_Areas_DeleteCascade
ON Areas
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM Users
    WHERE CurrentArea IN (SELECT AreaCode FROM deleted)
       OR Preference1 IN (SELECT AreaCode FROM deleted)
       OR Preference2 IN (SELECT AreaCode FROM deleted)
       OR Preference3 IN (SELECT AreaCode FROM deleted)
       OR RecentTrip IN (SELECT AreaCode FROM deleted);

    DELETE FROM ScheduledTrips
    WHERE StartLocation IN (SELECT AreaCode FROM deleted)
       OR Destination IN (SELECT AreaCode FROM deleted)
       OR CurrentLocation IN (SELECT AreaCode FROM deleted);
END;
GO

-- Trigger on Users: Cascade delete to Drivers, ScheduledTrips, TripRequests, Ratings, FriendsGroup, and Notifications.
CREATE TRIGGER trg_Users_DeleteCascade
ON Users
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM Drivers
    WHERE driverID IN (SELECT userID FROM deleted);

    DELETE FROM ScheduledTrips
    WHERE RequesterID IN (SELECT userID FROM deleted);

    DELETE FROM TripRequests
    WHERE PassengerID IN (SELECT userID FROM deleted);

    DELETE FROM Ratings
    WHERE DriverID IN (SELECT userID FROM deleted);

    DELETE FROM FriendsGroup
    WHERE groupAdmin IN (SELECT userID FROM deleted);

    DELETE FROM Notifications
    WHERE UserID IN (SELECT userID FROM deleted);
END;
GO

-- Trigger on Drivers: Cascade delete to ScheduledTrips, Payments, and Ratings that reference the deleted driver.
CREATE TRIGGER trg_Drivers_DeleteCascade
ON Drivers
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM ScheduledTrips
    WHERE DriverID IN (SELECT driverID FROM deleted);

    DELETE FROM Payments
    WHERE DriverID IN (SELECT driverID FROM deleted);

    DELETE FROM Ratings
    WHERE DriverID IN (SELECT driverID FROM deleted);
END;
GO

-- Trigger on ScheduledTrips: Cascade delete to Payments, Ratings, and Notifications.
CREATE TRIGGER trg_ScheduledTrips_DeleteCascade
ON ScheduledTrips
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    DELETE FROM Payments
    WHERE TripID IN (SELECT TripID FROM deleted);

    DELETE FROM Ratings
    WHERE TripID IN (SELECT TripID FROM deleted);

    DELETE FROM Notifications
    WHERE TripID IN (SELECT TripID FROM deleted);
END;



Go



/***********************
  Dummy inserts
***********************/



-- Reset identity counter for Vehicles table
DBCC CHECKIDENT ('Vehicles', RESEED, 1);

-- Reset identity counter for Users table
DBCC CHECKIDENT ('Users', RESEED, 1);

-- Reset identity counter for ScheduledTrips table
DBCC CHECKIDENT ('ScheduledTrips', RESEED, 1);

-- Reset identity counter for Payments table
DBCC CHECKIDENT ('Payments', RESEED, 1);

-- Reset identity counter for FriendsGroup table
DBCC CHECKIDENT ('FriendsGroup', RESEED, 1);

-- Reset identity counter for TripRequests table
DBCC CHECKIDENT ('TripRequests', RESEED, 1);

-- Reset identity counter for Ratings table
DBCC CHECKIDENT ('Ratings', RESEED, 1);

-- Reset identity counter for Notifications table
DBCC CHECKIDENT ('Notifications', RESEED, 1);


Go



INSERT INTO Areas (AreaCode, City, Society_TownName, RoadName, Blockk, sector, House_Organization, NearbyAreas, latitude, longitude) VALUES
(1, 'Lahore', 'Model Town', 'Main Blvd', 1, 'A', 'House #123', 'Near Kalma Chowk', 31.5204, 74.3587),
(2, 'Lahore', 'DHA', 'Phase 5', 5, 'B', 'Office #456', 'Near LUMS', 31.4700, 74.4100),
(3, 'Karachi', 'Gulshan', 'University Rd', 3, 'C', 'Flat #789', 'Near NIPA', 24.8607, 67.0011),
(4, 'Islamabad', 'F-10', 'Blue Area', 2, 'D', 'Apartment #101', 'Near Centaurus Mall', 33.6844, 73.0479),
(5, 'Karachi', 'Korangi', 'Main Rd', 4, 'E', 'Shop #789', 'Near Korangi Industrial Area', 24.8295, 67.1292);
Go

INSERT INTO Vehicles (Name, Color, Company, Typee, Capacity) VALUES
('Mehran', 'White', 'Suzuki', 'Mini', 4),
('Civic', 'Black', 'Honda', 'Comfort', 5),
('Changan', 'Blue', 'Karak', 'Rickshaw', 3),  
('Fortuner', 'Silver', 'Toyota', 'Luxury', 7),
('Honda Bike', 'Red', 'Honda', 'Bike', 2);
Go

INSERT INTO Users (Name, Email, Password, Gender, Age, City, UserStatus, Contact, EmergencyContact, CurrentArea, Preference1, Preference2, Preference3, RecentTrip) VALUES
('Ali Raza', 'ali@email.com', 'pass123', 'Male', 25, 'Lahore', 'Driver', '03001234567', '03111234567', 1, 2, 3, NULL, NULL),
('Fatima Noor', 'fatima@gmail.com', 'pass456', 'Female', 30, 'Lahore', 'Non-Driver', '03007654321', '03117654321', 2, 1, 3, NULL, NULL),
('Zain Ali', 'zain@email.com', 'password', 'Male', 22, 'Karachi', 'Driver', '03123456789', '03012345678', 3, 2, 4, NULL, NULL),
('Sarah Ahmed', 'sarah@gmail.com', 'mypassword', 'Female', 28, 'Islamabad', 'Non-Driver', '03087654321', '03123456789', 4, 1, 3, NULL, NULL),
('Usman Khokhar', 'usman@email.com', 'usman123', 'Male', 35, 'Karachi', 'Driver', '03010987654', '03111223344', 5, 2, 3, NULL, NULL);
Go

INSERT INTO Drivers (driverID, vehicleID, DriverStatus, Availability) VALUES
(1, 1, 'Hired', 'Yes'),
(2, 2, 'Collaborator', 'Yes'),
(3, 3, 'Hired', 'No'),
(4, 4, 'Collaborator', 'Yes'),
(5, 5, 'Hired', 'No');
Go

INSERT INTO ScheduledTrips (RequesterID, AvailableSeats, DriverID, StartLocation, Destination, Statuss, Routee, CurrentLocation, ExpectedDuration, DepartureTime, Travelers) VALUES
(2, -1, 1, 1, 2, 'Ongoing', 'Route via Kalma', 1, 45, '2025-04-05', 'Fatima, Ali'),
(1, 2, 2, 2, 3, 'Completed', 'Route DHA to Model Town', 3, 35, '2025-04-01', 'Ali'),
(3, -1, 1, 3, 4, 'Ongoing', 'Route Gulshan to F-10', 2, 60, '2025-04-10', 'Zain, Sarah'),
(4, 1, 4, 4, 5, 'Completed', 'Route F-10 to Korangi', 5, 50, '2025-04-15', 'Sarah, Usman'),
(5, -1, 3, 5, 1, 'Ongoing', 'Route Korangi to Model Town', 1, 40, '2025-04-20', 'Fatima, Usman');
Go

INSERT INTO Payments (TripID, DriverID, EarnedAmount, Statuss, PaymentDate) VALUES
(2, 1, 500, 'Paid', '2025-04-02'),
(4, 2, 600, 'Paid', '2025-04-05'),
(1, 3, 450, 'Unpaid', '2025-04-10'),
(5, 4, 550, 'Paid', '2025-04-15'),
(3, 5, 400, 'Unpaid', '2025-04-20');
Go


INSERT INTO FriendsGroup (groupAdmin, TotalMembers, TripsCompleted, OtherMembers) VALUES
(1, 2, 3, 'Ali, Fatima'),
(2, 3, 2, 'Zain, Sarah, Usman'),
(3, 2, 4, 'Zain, Sarah'),
(4, 4, 1, 'Usman, Fatima, Ali, Sarah'),
(5, 2, 3, 'Usman, Zain');
Go

INSERT INTO TripRequests (PassengerID, PickupLocation, DropoffLocation, TripDateTime, Statuss) VALUES
(2, 'Main Blvd', 'DHA', GETDATE(), 'Pending'),
(1, 'DHA Phase 5', 'Korangi', GETDATE(), 'Approved'),
(3, 'Korangi', 'Model Town', GETDATE(), 'Pending'),
(4, 'F-10', 'Gulshan', GETDATE(), 'Approved'),
(5, 'Gulshan', 'DHA', GETDATE(), 'Pending');
Go


INSERT INTO Ratings (TripID, PassengerID, DriverID, Rating, Review) VALUES
(2, 2, 1, 5, 'Great ride!'),
(4, 4, 2, 4, 'Smooth but a bit slow.'),
(1, 1, 3, 3, 'Okay experience, but could be better.'),
(5, 5, 4, 5, 'Loved the trip, great driver!'),
(3, 3, 1, 4, 'Nice and comfortable, could improve route knowledge.');
Go


INSERT INTO Notifications (UserID, TripID, Message, IsRead, CreatedAt) VALUES
(1, 1, 'Your trip has started!', 0, DATEADD(DAY, -2, GETDATE())),
(2, 2, 'Your trip has completed.', 0, DATEADD(DAY, -40, GETDATE())),
(3, 3, 'Your trip is about to start soon!', 1, DATEADD(DAY, -1, GETDATE())),
(4, 4, 'Your trip has been canceled.', 1, DATEADD(DAY, -5, GETDATE())),
(5, 5, 'Driver has been assigned to your trip.', 0, DATEADD(DAY, -10, GETDATE()));





Go





/***********************
 update queries
***********************/

CREATE TRIGGER trg_UserStatusChange
ON Users
AFTER UPDATE
AS
BEGIN
    --status changes from Driver to Non-Driver
    DELETE FROM Drivers
    WHERE DriverID IN (
        SELECT i.UserID
        FROM inserted i
        JOIN deleted d ON i.UserID = d.UserID
        WHERE d.UserStatus = 'Driver' AND i.UserStatus = 'Non-Driver'
    );

    --status changes from Non-Driver to Driver
    INSERT INTO Drivers (DriverID, VehicleID, DriverStatus, Availability)
    SELECT i.UserID, NULL, 'Collaborator', 'No'
    FROM inserted i
    JOIN deleted d ON i.UserID = d.UserID
    WHERE d.UserStatus = 'Non-Driver' AND i.UserStatus = 'Driver'
    AND NOT EXISTS (SELECT 1 FROM Drivers WHERE DriverID = i.UserID);
END;
Go

--to update user (all or specific attribute - works for both)
CREATE PROCEDURE UpdateUser
    @UserID INT,
    @Name VARCHAR(150) = NULL,
    @Email VARCHAR(255) = NULL,
    @Password VARCHAR(255) = NULL,
    @Gender VARCHAR(7) = NULL,
    @Age INT = NULL,
    @City VARCHAR(20) = NULL,
    @UserStatus VARCHAR(10) = NULL,
    @Contact VARCHAR(12) = NULL,
    @EmergencyContact VARCHAR(12) = NULL,
    @CurrentArea INT = NULL,
    @Preference1 INT = NULL,
    @Preference2 INT = NULL,
    @Preference3 INT = NULL,
    @RecentTrip INT = NULL,
    @IsActive BIT = NULL
AS
BEGIN
    -- Check if the email already exists
    IF @Email IS NOT NULL AND EXISTS (SELECT 1 FROM Users WHERE Email = @Email AND UserID <> @UserID)
    BEGIN
        PRINT 'Email already exists!';
        RETURN;
    END

    UPDATE Users
    SET Name = COALESCE(@Name, Name),
        Email = COALESCE(@Email, Email),
        Password = COALESCE(@Password, Password),
        Gender = COALESCE(@Gender, Gender),
        Age = COALESCE(@Age, Age),
        City = COALESCE(@City, City),
        UserStatus = COALESCE(@UserStatus, UserStatus),
        Contact = COALESCE(@Contact, Contact),
        EmergencyContact = COALESCE(@EmergencyContact, EmergencyContact),
        CurrentArea = COALESCE(@CurrentArea, CurrentArea),
        Preference1 = COALESCE(@Preference1, Preference1),
        Preference2 = COALESCE(@Preference2, Preference2),
        Preference3 = COALESCE(@Preference3, Preference3),
        RecentTrip = COALESCE(@RecentTrip, RecentTrip),
        IsActive = COALESCE(@IsActive, IsActive)
    WHERE UserID = @UserID;
END;
Go

-- Update procedure for Drivers
CREATE PROCEDURE UpdateDriver
    @DriverID INT,
    @VehicleID INT = NULL,
    @DriverStatus VARCHAR(12) = NULL,
    @Availability VARCHAR(3) = NULL
AS
BEGIN
    -- Check if VehicleID exists
    IF @VehicleID IS NOT NULL AND NOT EXISTS (SELECT 1 FROM Vehicles WHERE VehicleID = @VehicleID)
    BEGIN
        RAISERROR ('Vehicle ID does not exist', 16, 1);
        RETURN;
    END

    UPDATE Drivers
    SET VehicleID = COALESCE(@VehicleID, VehicleID),
        DriverStatus = COALESCE(@DriverStatus, DriverStatus),
        Availability = COALESCE(@Availability, Availability)
    WHERE DriverID = @DriverID;
END;
Go


-- Update procedure for area
CREATE PROCEDURE UpdateArea
    @AreaCode INT,
    @City VARCHAR(100) = NULL,
    @Society_TownName VARCHAR(100) = NULL,
    @RoadName VARCHAR(30) = NULL,
    @Blockk INT = NULL,
    @Sector VARCHAR(4) = NULL,
    @House_Organization VARCHAR(20) = NULL,
    @NearbyAreas TEXT = NULL
AS
BEGIN
    UPDATE Areas
    SET City = COALESCE(@City, City),
        Society_TownName = COALESCE(@Society_TownName, Society_TownName),
        RoadName = COALESCE(@RoadName, RoadName),
        Blockk = COALESCE(@Blockk, Blockk),
        Sector = COALESCE(@Sector, Sector),
        House_Organization = COALESCE(@House_Organization, House_Organization),
        NearbyAreas = COALESCE(@NearbyAreas, NearbyAreas)
    WHERE AreaCode = @AreaCode;
END;
Go

-- Update procedure for vehicles
CREATE PROCEDURE UpdateVehicle
    @VehicleID INT,
    @Name VARCHAR(20) = NULL,
    @Color VARCHAR(10) = NULL,
    @Company VARCHAR(15) = NULL,
    @Typee VARCHAR(7) = NULL,
    @Capacity INT = NULL  
AS
BEGIN
    UPDATE Vehicles
    SET Name = COALESCE(@Name, Name),
        Color = COALESCE(@Color, Color),
        Company = COALESCE(@Company, Company),
        Typee = COALESCE(@Typee, Typee),
        Capacity = COALESCE(@Capacity, Capacity)       
    WHERE VehicleID = @VehicleID;
END;
Go


-- Update procedure for ScheduledTrips
CREATE PROCEDURE UpdateScheduledTrip
    @TripID INT,
    @AvailableSeats INT = NULL,
    @DriverID INT = NULL,
    @Statuss VARCHAR(12) = NULL,
    @CurrentLocation INT = NULL,
    @ExpectedDuration INT = NULL,
    @Travelers TEXT = NULL
AS
BEGIN
     DECLARE @OldtripStatus VARCHAR(12);
     SELECT @OldtripStatus = Statuss FROM ScheduledTrips WHERE TripID = @TripID;

    UPDATE ScheduledTrips
    SET 
        AvailableSeats = COALESCE(@AvailableSeats, AvailableSeats),
        DriverID = COALESCE(@DriverID, DriverID),
        Statuss = COALESCE(@Statuss, Statuss),
        CurrentLocation = COALESCE(@CurrentLocation, CurrentLocation),
        ExpectedDuration = COALESCE(@ExpectedDuration, ExpectedDuration),
        Travelers = COALESCE(@Travelers, Travelers)
    WHERE TripID = @TripID;
    
    -- If status is changed to 'Completed', insert into Ratings and Payments
    IF @Statuss = 'Completed' and @OldtripStatus <> 'Completed'
    BEGIN
        INSERT INTO Ratings (TripID, DriverID)
        VALUES (@TripID, @DriverID);
        
        INSERT INTO Payments (TripID, DriverID, Statuss)
        VALUES (@TripID, @DriverID, 'Pending');
    END
END;
Go

-- Update procedure for TripRequests
CREATE PROCEDURE UpdateTripRequest
    @RequestID INT,
    @PickupLocation VARCHAR(255) = NULL,
    @DropoffLocation VARCHAR(255) = NULL,
    @TripDateTime DATETIME = NULL,
    @Statuss VARCHAR(50) = NULL
AS
BEGIN
    DECLARE @PreviousStatus VARCHAR(50);
    SELECT @PreviousStatus = Statuss FROM TripRequests WHERE RequestID = @RequestID;
    
    UPDATE TripRequests
    SET 
        PickupLocation = COALESCE(@PickupLocation, PickupLocation),
        DropoffLocation = COALESCE(@DropoffLocation, DropoffLocation),
        TripDateTime = COALESCE(@TripDateTime, TripDateTime),
        Statuss = COALESCE(@Statuss, Statuss)
    WHERE RequestID = @RequestID;
    
    -- If status changed to 'Approved' and was not previously 'Approved', insert into ScheduledTrips
    IF @Statuss = 'Approved' AND @PreviousStatus <> 'Approved'
    BEGIN
        INSERT INTO ScheduledTrips (RequesterID, StartLocation, Destination, DepartureTime)
        SELECT PassengerID, PickupLocation, DropoffLocation, TripDateTime
        FROM TripRequests WHERE RequestID = @RequestID;
    END
END;
Go

-- Update procedure for Payments
CREATE PROCEDURE UpdatePayment
    @PaymentID INT,
    @EarnedAmount INT = NULL,
    @Statuss VARCHAR(6) = NULL,
    @PaymentDate DATE = NULL
AS
BEGIN
    UPDATE Payments
    SET 
        EarnedAmount = COALESCE(@EarnedAmount, EarnedAmount),
        Statuss = COALESCE(@Statuss, Statuss),
        PaymentDate = COALESCE(@PaymentDate, PaymentDate)
    WHERE PaymentID = @PaymentID;
END;
Go

-- Update procedure for FriendsGroup
CREATE PROCEDURE UpdateFriendsGroup
    @GroupNo INT,
    @GroupAdmin INT = NULL,
    @TotalMembers INT = NULL,
    @TripsCompleted INT = NULL,
    @OtherMembers TEXT = NULL
AS
BEGIN
    UPDATE FriendsGroup
    SET GroupAdmin = COALESCE(@GroupAdmin, GroupAdmin),
        TotalMembers = COALESCE(@TotalMembers, TotalMembers),
        TripsCompleted = COALESCE(@TripsCompleted, TripsCompleted),
        OtherMembers = COALESCE(@OtherMembers, OtherMembers)
    WHERE GroupNo = @GroupNo;
END;
Go


-- Update procedure for Ratings
CREATE PROCEDURE UpdateRating
    @RatingID INT,
    @Rating INT = NULL,
    @Review TEXT = NULL,
    @RatedAt DATETIME = NULL
AS
BEGIN
    UPDATE Ratings
    SET 
        Rating = COALESCE(@Rating, Rating),
        Review = COALESCE(@Review, Review),
        RatedAt = COALESCE(@RatedAt, RatedAt)
    WHERE RatingID = @RatingID;
END;
Go

-- Update procedure for Notifications
CREATE PROCEDURE UpdateNotification
    @NotificationID INT,
	@TripID INT,
    @Message VARCHAR(500) = NULL,
    @IsRead BIT = NULL
AS
BEGIN
    UPDATE Notifications
    SET 
	   TripID=COALESCE(@TripID, TripID),
        Message = COALESCE(@Message, Message),
        IsRead = COALESCE(@IsRead, IsRead)
    WHERE NotificationID = @NotificationID;
END;




Go


/***********************
   Insert Queries
***********************/


CREATE PROCEDURE InsertArea
    @AreaCode int,
    @City varchar(20),
    @Society_TownName varchar(100) = NULL,
    @RoadName varchar(100) = NULL,
    @Blockk int = NULL,
    @sector varchar(4) = NULL,
    @House_Organization varchar(100),
    @NearbyAreas Text = NULL,
    @latitude float = NULL,
    @longitude float = NULL
AS
BEGIN
    INSERT INTO Areas (AreaCode, City, Society_TownName, RoadName, Blockk, sector, House_Organization, NearbyAreas, latitude, longitude)
    VALUES (@AreaCode, @City, @Society_TownName, @RoadName, @Blockk, @sector, @House_Organization, @NearbyAreas, @latitude, @longitude);
END
GO


CREATE PROCEDURE InsertVehicle
    @Name varchar(20),
    @Color varchar(10),
    @Company varchar(15),
    @Typee varchar(7),
    @Capacity int
AS
BEGIN
    INSERT INTO Vehicles (Name, Color, Company, Typee, Capacity)
    VALUES (@Name, @Color, @Company, @Typee, @Capacity);
END
GO


CREATE PROCEDURE InsertUser
    @Name varchar(150) = 'Unknown',
    @Email varchar(255),
    @Password varchar(255),
    @Gender varchar(7),
    @Age int,
    @City varchar(20),
    @UserStatus varchar(10),
    @Contact varchar(12),
    @EmergencyContact varchar(12),
    @CurrentArea int = NULL,
    @Preference1 int = NULL,
    @Preference2 int = NULL,
    @Preference3 int = NULL,
    @RecentTrip int = NULL,
    @vehicleID int = NULL, 
    @DriverStatus varchar(12) = NULL,
    @Availability varchar(3) = NULL
AS
BEGIN
    DECLARE @InsertedUserID int;

   
    INSERT INTO Users (Name, Email, Password, Gender, Age, City, UserStatus, Contact, EmergencyContact, CurrentArea, Preference1, Preference2, Preference3, RecentTrip)
    VALUES (@Name, @Email, @Password, @Gender, @Age, @City, @UserStatus, @Contact, @EmergencyContact, @CurrentArea, @Preference1, @Preference2, @Preference3, @RecentTrip);

    -- Get the inserted user's ID
    SET @InsertedUserID = SCOPE_IDENTITY();

    -- If UserStatus is 'Driver' and they are not already in Drivers table, insert them
    IF @UserStatus = 'Driver'
    BEGIN
       
        IF @vehicleID IS NULL OR @DriverStatus IS NULL OR @Availability IS NULL
        BEGIN
            PRINT 'Driver details missing: VehicleID, DriverStatus, or Availability is required';
            RETURN;
        END

        INSERT INTO Drivers (driverID, vehicleID, DriverStatus, Availability)
        VALUES (@InsertedUserID, @vehicleID, @DriverStatus, @Availability);
    END
END
GO


CREATE PROCEDURE InsertDriver
    @userID int,
    @vehicleID int,
    @DriverStatus varchar(12),
    @Availability varchar(3)
AS
BEGIN
    INSERT INTO Drivers (driverID, vehicleID, DriverStatus, Availability)
    VALUES (@userID, @vehicleID, @DriverStatus, @Availability);
END
GO


CREATE PROCEDURE InsertScheduledTrip
    @RequesterID int,
    @AvailableSeats int = -1,
    @DriverID int = NULL,
    @StartLocation int,
    @Destination int,
    @Statuss varchar(12),
    @Routee text,
    @CurrentLocation int = NULL,
    @ExpectedDuration int,
    @DepartureTime date,
    @Travelers text
AS
BEGIN
    DECLARE @InsertedTripID int;

   
    INSERT INTO ScheduledTrips (RequesterID, AvailableSeats, DriverID, StartLocation, Destination, Statuss, Routee, CurrentLocation, ExpectedDuration, DepartureTime, Travelers)
    VALUES (@RequesterID, @AvailableSeats, @DriverID, @StartLocation, @Destination, @Statuss, @Routee, @CurrentLocation, @ExpectedDuration, @DepartureTime, @Travelers);

    -- Get the ID of the inserted trip
    SET @InsertedTripID = SCOPE_IDENTITY();

    
    IF @Statuss = 'Completed' AND @DriverID IS NOT NULL
    BEGIN
        
        INSERT INTO Ratings (TripID, PassengerID, DriverID, Rating, Review)
        VALUES (@InsertedTripID, @RequesterID, @DriverID, NULL, NULL);

       
        INSERT INTO Payments (TripID, DriverID, EarnedAmount, Statuss, PaymentDate)
        VALUES (@InsertedTripID, @DriverID, 0, 'Unpaid', NULL);
    END
END
GO


CREATE PROCEDURE InsertPayment
    @TripID int,
    @DriverID int,
    @EarnedAmount int,
    @Statuss varchar(6),
    @PaymentDate date = NULL
AS
BEGIN
    INSERT INTO Payments (TripID, DriverID, EarnedAmount, Statuss, PaymentDate)
    VALUES (@TripID, @DriverID, @EarnedAmount, @Statuss, @PaymentDate);
END
GO


CREATE PROCEDURE InsertFriendsGroup
    @groupAdmin int,
    @TotalMembers int,
    @TripsCompleted int = NULL,
    @OtherMembers text = NULL
AS
BEGIN
    INSERT INTO FriendsGroup (groupAdmin, TotalMembers, TripsCompleted, OtherMembers)
    VALUES (@groupAdmin, @TotalMembers, @TripsCompleted, @OtherMembers);
END
GO


CREATE PROCEDURE InsertTripRequest
    @PassengerID int,
    @PickupLocation varchar(255),
    @DropoffLocation varchar(255),
    @TripDateTime datetime,
    @Statuss varchar(50) = 'Pending'
AS
BEGIN
    INSERT INTO TripRequests (PassengerID, PickupLocation, DropoffLocation, TripDateTime, Statuss)
    VALUES (@PassengerID, @PickupLocation, @DropoffLocation, @TripDateTime, @Statuss);
END
GO


CREATE PROCEDURE InsertRating
    @TripID int,
    @PassengerID int,
    @DriverID int,
    @Rating int,
    @Review text = NULL
AS
BEGIN
    INSERT INTO Ratings (TripID, PassengerID, DriverID, Rating, Review)
    VALUES (@TripID, @PassengerID, @DriverID, @Rating, @Review);
END
GO


CREATE PROCEDURE InsertNotification
    @UserID int,
    @TripID int = NULL,
    @Message varchar(500),
    @IsRead bit = 0
AS
BEGIN
    INSERT INTO Notifications (UserID, TripID, Message, IsRead)
    VALUES (@UserID, @TripID, @Message, @IsRead);
END
GO



/***********************
  Delete Queries
***********************/
CREATE PROCEDURE DeleteArea
    @AreaCode int
AS
BEGIN
    DELETE FROM Areas WHERE AreaCode = @AreaCode;
END
GO

CREATE PROCEDURE DeleteVehicle
    @vehicleID int
AS
BEGIN
    DELETE FROM Vehicles WHERE vehicleID = @vehicleID;
END
GO

CREATE PROCEDURE DeleteUser
    @userID int
AS
BEGIN
    DELETE FROM Users WHERE userID = @userID;
END
GO

CREATE PROCEDURE DeleteDriver
    @driverID int
AS
BEGIN
    DELETE FROM Drivers WHERE driverID = @driverID;
END
GO

CREATE PROCEDURE DeleteScheduledTrip
    @TripID int
AS
BEGIN
    DELETE FROM ScheduledTrips WHERE TripID = @TripID;
END
GO

CREATE PROCEDURE DeletePayment
    @PaymentID int
AS
BEGIN
    DELETE FROM Payments WHERE PaymentID = @PaymentID;
END
GO

CREATE PROCEDURE DeleteFriendsGroup
    @GroupNo int
AS
BEGIN
    DELETE FROM FriendsGroup WHERE GroupNo = @GroupNo;
END
GO

CREATE PROCEDURE DeleteTripRequest
    @RequestID int
AS
BEGIN
    DELETE FROM TripRequests WHERE RequestID = @RequestID;
END
GO

CREATE PROCEDURE DeleteRating
    @RatingID int
AS
BEGIN
    DELETE FROM Ratings WHERE RatingID = @RatingID;
END
GO

CREATE PROCEDURE DeleteNotification
    @NotificationID int
AS
BEGIN
    DELETE FROM Notifications WHERE NotificationID = @NotificationID;
END
GO



/**************************************
   Some Other Delete Procedures
***************************************/

-- Delete unmapped areas 
CREATE PROCEDURE DeleteUnmappedAreas
AS
BEGIN
    
    DELETE FROM Areas
    WHERE latitude IS NULL OR longitude IS NULL;
END
GO


-- Delete vehicles by a specific type 
CREATE PROCEDURE DeleteVehiclesByType
    @Typee varchar(7)
AS
BEGIN
    
    DELETE FROM Vehicles
    WHERE Typee = @Typee;
END
GO


-- Delete inactive users who are not admins
CREATE PROCEDURE DeleteInactiveUsers
AS
BEGIN
    
    DELETE FROM Users
    WHERE IsActive = 0 AND isAdmin = 0;
END
GO


-- Delete drivers whose availability is set to 'No'
CREATE PROCEDURE DeleteUnavailableDrivers
AS
BEGIN
    
    DELETE FROM Drivers
    WHERE Availability = 'No';
END
GO


-- Delete cancelled trips that are older than today
CREATE PROCEDURE DeleteOldCancelledTrips
AS
BEGIN
    
    DELETE FROM ScheduledTrips
    WHERE Statuss = 'Cancelled' AND DepartureTime < CAST(GETDATE() AS date);
END
GO


-- Delete unpaid payments that are older than a given date
CREATE PROCEDURE DeleteStaleUnpaidPayments
    @BeforeDate date
AS
BEGIN
    
    DELETE FROM Payments
    WHERE Statuss = 'Unpaid' AND PaymentDate IS NOT NULL AND PaymentDate < @BeforeDate;
END
GO


-- Delete friends groups with no trips completed
CREATE PROCEDURE DeleteInactiveGroups
AS
BEGIN
   
    DELETE FROM FriendsGroup
    WHERE TripsCompleted IS NULL OR TripsCompleted = 0;
END
GO


-- Delete pending trip requests older than 3 days
CREATE PROCEDURE DeleteOldPendingRequests
AS
BEGIN
    -- Deletes trip requests in pending state that are older than 3 days
    DELETE FROM TripRequests
    WHERE Statuss = 'Pending' AND TripDateTime < DATEADD(DAY, -3, GETDATE());
END
GO


-- Delete ratings where both rating and review are null
CREATE PROCEDURE DeleteEmptyRatings
AS
BEGIN
    
    DELETE FROM Ratings
    WHERE Rating IS NULL AND Review IS NULL;
END
GO


-- Delete notifications that are read and older than 7 days
CREATE PROCEDURE DeleteOldReadNotifications
AS
BEGIN
    -- Deletes read notifications older than one week
    DELETE FROM Notifications
    WHERE IsRead = 1 AND CreatedAt < DATEADD(DAY, -7, GETDATE());
END
GO


-- Delete scheduled trips that have no assigned driver and are in the past
CREATE PROCEDURE DeleteUnassignedOldTrips
AS
BEGIN
   
    DELETE FROM ScheduledTrips
    WHERE DriverID IS NULL AND DepartureTime < CAST(GETDATE() AS date);
END
GO

-- Delete payments that have zero earned amount
CREATE PROCEDURE DeleteZeroAmountPayments
AS
BEGIN
  
    DELETE FROM Payments
    WHERE EarnedAmount = 0;
END
GO

-- Delete drivers not associated with any vehicle 
CREATE PROCEDURE DeleteDriversWithoutVehicles
AS
BEGIN
    
    DELETE FROM Drivers
    WHERE vehicleID IS NULL;
END
GO

-- Delete notifications linked to trips that are marked as 'Completed'
CREATE PROCEDURE DeleteCompletedTripNotifications
AS
BEGIN
    
    DELETE FROM Notifications
    WHERE TripID IN (
        SELECT TripID FROM ScheduledTrips WHERE Statuss = 'Completed'
    );
END
GO



-- Delete areas with no users living there (unlinked areas)
CREATE PROCEDURE DeleteUnusedAreas
AS
BEGIN
    -- Deletes areas not referenced by any user
    DELETE FROM Areas
    WHERE AreaCode NOT IN (
        SELECT CurrentArea FROM Users WHERE CurrentArea IS NOT NULL
        UNION
        SELECT Preference1 FROM Users WHERE Preference1 IS NOT NULL
        UNION
        SELECT Preference2 FROM Users WHERE Preference2 IS NOT NULL
        UNION
        SELECT Preference3 FROM Users WHERE Preference3 IS NOT NULL
    );
END
GO


-- Delete groups that have fewer than 2 members and are inactive
CREATE PROCEDURE DeleteEmptyOrInactiveGroups
AS
BEGIN
   
    DELETE FROM FriendsGroup
    WHERE TotalMembers < 2 AND (TripsCompleted IS NULL OR TripsCompleted = 0);
END
GO


/**************************************
                Views
***************************************/

--Shows complete trip info: requester, driver, route, status, departure, and passengers.
CREATE VIEW vw_TripDetails AS
SELECT 
    t.TripID,
    u.Name AS RequesterName,
    d.DriverID,
    du.Name AS DriverName,
    a1.Society_TownName AS StartLocation,
    a2.Society_TownName AS Destination,
    t.Statuss,
    t.DepartureTime,
    t.AvailableSeats,
    t.Routee,
    t.Travelers
FROM ScheduledTrips t
LEFT JOIN Users u ON t.RequesterID = u.UserID
LEFT JOIN Drivers d ON t.DriverID = d.DriverID
LEFT JOIN Users du ON d.DriverID = du.UserID
LEFT JOIN Areas a1 ON t.StartLocation = a1.AreaCode
LEFT JOIN Areas a2 ON t.Destination = a2.AreaCode;


--Provides a cleaner public-facing version of users without passwords or sensitive info.
CREATE VIEW vw_UsersBasicInfo AS
SELECT 
    UserID,
    Name,
    Email,
    Gender,
    Age,
    City,
    UserStatus,
    Contact,
    IsActive,
    isAdmin
FROM Users;

--Shows driver profiles with associated vehicle data.
CREATE VIEW vw_DriverProfiles AS
SELECT 
    d.DriverID,
    u.Name AS DriverName,
    u.Email,
    v.Name AS VehicleName,
    v.Typee,
    v.Capacity,
    d.DriverStatus,
    d.Availability
FROM Drivers d
JOIN Users u ON d.DriverID = u.UserID
LEFT JOIN Vehicles v ON d.VehicleID = v.VehicleID;

--Payments made for completed trips along with driver names and amounts.
CREATE VIEW vw_TripPayments AS
SELECT 
    p.PaymentID,
    p.TripID,
    u.Name AS DriverName,
    p.EarnedAmount,
    p.Statuss,
    p.PaymentDate
FROM Payments p
JOIN Drivers d ON p.DriverID = d.DriverID
JOIN Users u ON d.DriverID = u.UserID;

--View all unapproved trip requests with passenger names.
CREATE VIEW vw_TripRequestsPending AS
SELECT 
    r.RequestID,
    u.Name AS PassengerName,
    r.PickupLocation,
    r.DropoffLocation,
    r.TripDateTime,
    r.Statuss
FROM TripRequests r
JOIN Users u ON r.PassengerID = u.UserID
WHERE r.Statuss = 'Pending';

--Shows reviews and ratings for each trip with both driver and passenger names.
CREATE VIEW vw_RatingsSummary AS
SELECT 
    r.RatingID,
    r.TripID,
    ru.Name AS PassengerName,
    du.Name AS DriverName,
    r.Rating,
    r.Review,
    r.RatedAt
FROM Ratings r
JOIN Users ru ON r.PassengerID = ru.UserID
JOIN Users du ON r.DriverID = du.UserID;

--View of unread notifications with user names and trip info (if any).
CREATE VIEW vw_NotificationsUnread AS
SELECT 
    n.NotificationID,
    u.Name AS UserName,
    n.TripID,
    n.Message,
    n.CreatedAt
FROM Notifications n
JOIN Users u ON n.UserID = u.UserID
WHERE n.IsRead = 0;


SELECT * FROM vw_TripDetails;
SELECT * FROM vw_UsersBasicInfo;
SELECT * FROM vw_DriverProfiles;
SELECT * FROM vw_TripPayments;

SELECT * FROM vw_TripRequestsPending;
SELECT * FROM vw_RatingsSummary;
SELECT * FROM vw_NotificationsUnread;



-- Drop tables in order from dependent to independent

--DROP TABLE IF EXISTS Notifications;
--DROP TABLE IF EXISTS Ratings;
--DROP TABLE IF EXISTS TripRequests;
--DROP TABLE IF EXISTS FriendsGroup;
--DROP TABLE IF EXISTS Payments;
--DROP TABLE IF EXISTS ScheduledTrips;
--DROP TABLE IF EXISTS Drivers;
--DROP TABLE IF EXISTS Vehicles;
--DROP TABLE IF EXISTS Users;
--DROP TABLE IF EXISTS Areas;


--Tables
select * from Users;
select * from Drivers;
select * from Areas;
select * from Vehicles;
select * from ScheduledTrips;
select * from Payments;
select * from FriendsGroup;
select * from TripRequests;
select * from Ratings;
select * from�Notifications;


