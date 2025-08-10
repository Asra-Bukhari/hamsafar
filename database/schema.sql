				

				create database carpoolingManagementSystem;
				use carpoolingManagementSystem;
				Go

				/***********************
				  1. Users Table
				***********************/
				create table Users(
				userID int IDENTITY(1,1) constraint userID_pk PRIMARY KEY,
				Name varchar(150) DEFAULT 'Unknown',
				Email varchar(255) UNIQUE NOT NULL check(Email like '%@email.com' or Email like '%@gmail.com'),
				Password varchar(255) NOT NULL,
				Gender varchar(7) CHECK (Gender = 'Male' or Gender = 'Female'),
				Age int CHECK (Age>=18),
				City varchar(20) NOT NULL,
				UserStatus varchar(10) CHECK (Userstatus = 'Driver' or Userstatus = 'Non-Driver'),
				Contact varchar(12) NOT NULL,
				EmergencyContact varchar(12) NOT NULL,
				CurrentArea int,
				Preference1 int,
				Preference2 int,
				Preference3 int,
				RecentTrip int,
				IsActive bit DEFAULT 1,
				);


				/***********************
				  2. Drivers Table
				***********************/
				create table Drivers(
				driverID int constraint driverID_pk PRIMARY KEY constraint driverID_fk FOREIGN KEY REFERENCES Users(userID),
				vehicleID int,
				DriverStatus varchar(12) CHECK (DriverStatus = 'Hired' or DriverStatus = 'Collaborator'),
				Availability varchar(3) NOT NULL CHECK (Availability ='Yes' or Availability = 'No')
				);


				/***********************
				  3. Areas Table
				***********************/
				create table Areas(
				AreaCode int constraint areaCode_pk PRIMARY KEY,
				City varchar(20) ,
				Society_TownName varchar(30) Null,
				RoadName varchar(30) Default Null,
				Blockk int default null,
				sector varchar(4) default null,
				House_Organization varchar(20) null,
				NearbyAreas Text,
				UNIQUE(AreaCode),
				latitude float,
				longitude float
				);
				

				/***********************
				  4. Vehicles Table
				***********************/
				create table Vehicles(
				vehicleID int IDENTITY(1,1) constraint vehicleID_pk PRIMARY KEY,
				Name varchar(20) not null,
				Color varchar(10) Not Null,
				Company varchar(15) not Null,
				Typee varchar(7) CHECK (Typee = 'Mini' or Typee = 'Luxury' or Typee = 'Comfort' or Typee = 'Rickshaw' or Typee = 'Bike'),
				Capacity int not null,
				);
				

				/**************************
				  5. Schedules Trips Table
				***************************/
				create table ScheduledTrips(
				TripID int IDENTITY(1,1) constraint tripID_pk PRIMARY KEY,
				RequesterID int constraint requesterID_fk FOREIGN KEY REFERENCES Users(userID),
				AvailableSeats int default -1,  --if requester is not a driver 
				DriverID int default null constraint dID_fk FOREIGN KEY REFERENCES Drivers(driverID),
				StartLocation int constraint start_fk FOREIGN KEY REFERENCES Areas(AreaCode),
				Destination int constraint dest_fk FOREIGN KEY REFERENCES Areas(AreaCode),
				Statuss varchar(12) CHECK (Statuss= 'Ongoing' or Statuss = 'Cancelled' or Statuss='Completed'),
				Routee Text,
				CurrentLocation int constraint curr_fk FOREIGN KEY REFERENCES Areas(AreaCode),
				ExpectedDuration int,
				DepartureTime Date,
				Travelers Text
				);
				
			
				/***********************
				  6. Payments Table
				***********************/
				create table Payments(
				PaymentID int IDENTITY(1,1) constraint paymentID_pk PRIMARY KEY,
				TripID int constraint tripID_fk FOREIGN KEY REFERENCES ScheduledTrips(TripID),
				DriverID int constraint driverID_fk2 FOREIGN KEY REFERENCES Drivers(DriverID),
				EarnedAmount int,
				Statuss varchar(6) CHECK (Statuss='Paid' or Statuss='Unpaid'),
				PaymentDate Date default null
				);
				
			
			
				/*************************
				  7. Friends Group Table
				*************************/
				create table FriendsGroup(
				GroupNo int IDENTITY(1,1) constraint group_pk PRIMARY KEY,
				groupAdmin int constraint admin_fk FOREIGN KEY REFERENCES Users(UserID),
				TotalMembers int CHECK (TotalMembers <= 4),
				TripsCompleted int default null,
				OtherMembers Text
				);


				/*************************
				  8. Trips Requests Table
				*************************/
				Create Table TripRequests (
					RequestID int IDENTITY(1,1) constraint tr_pk Primary key,
					PassengerID int NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
					PickupLocation varchar(255) NOT NULL,
					DropoffLocation varchar(255) NOT NULL,
					TripDateTime Datetime NOT NULL,
					Statuss varchar(50) DEFAULT 'Pending' check(Statuss='approved' or Statuss ='Pending'),
					CreatedAt Datetime DEFAULT GETDATE(), 
				);
			

				/*************************
				  9. Ratings Table
				*************************/
				Create Table Ratings (
					RatingID int IDENTITY(1,1) PRIMARY KEY,
					TripID int NOT NULL REFERENCES ScheduledTrips(TripID), 
					DriverID int NOT NULL REFERENCES Users(UserID),
					Rating int CHECK (Rating BETWEEN 1 AND 5), 
					Review text NULL, 
					RatedAt Datetime DEFAULT GETDATE(), 
				);
				

				/*************************
				  10. Notifications Table
				*************************/
				Create Table Notifications (
					NotificationID int IDENTITY(1,1) PRIMARY KEY,
					UserID int NOT NULL REFERENCES Users(UserID) ON DELETE CASCADE,
					TripID int NULL REFERENCES ScheduledTrips(TripID) ON DELETE CASCADE, 
					Message varchar(500) NOT NULL, 
					IsRead bit DEFAULT 0, -- 0 = Unread, 1 = Read
					CreatedAt Datetime DEFAULT GETDATE(),   
				);
				
				
				-- Additional Constraints on Users
				ALTER TABLE Users
				ADD CONSTRAINT CA_Fk
				FOREIGN KEY (CurrentArea) REFERENCES Areas(AreaCode);

				ALTER TABLE Users
				ADD CONSTRAINT p1_Fk
				FOREIGN KEY (Preference1) REFERENCES Areas(AreaCode);

				ALTER TABLE Users
				ADD CONSTRAINT p2_Fk
				FOREIGN KEY (Preference2) REFERENCES Areas(AreaCode);

				ALTER TABLE Users
				ADD CONSTRAINT p3_Fk
				FOREIGN KEY (Preference3) REFERENCES Areas(AreaCode);

				ALTER TABLE Users
				ADD CONSTRAINT Rt_Fk
				FOREIGN KEY (RecentTrip) REFERENCES Areas(AreaCode);

				-- Additional Constraints on Drivers

				ALTER TABLE Drivers
				ADD CONSTRAINT vehID_Fk
				FOREIGN KEY (vehicleID) REFERENCES Vehicles(vehicleID);

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
				select * from Notifications;
