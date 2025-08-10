use carpoolingManagementSystem;
Go

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



-- Update procedure for area
CREATE PROCEDURE UpdateArea
    @AreaCode INT,
    @City VARCHAR(20) = NULL,
    @Society_TownName VARCHAR(30) = NULL,
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
