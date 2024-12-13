-- Create the database
CREATE DATABASE AnimalDatabase;

-- Use the database
USE AnimalDatabase;

-- Create the Animals table
CREATE TABLE Animals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    animal_name VARCHAR(255) NOT NULL,
    species VARCHAR(255) NOT NULL,
    grades VARCHAR(255) NOT NULL
);

-- Create the Continents table
CREATE TABLE Continents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    continent_name VARCHAR(255) NOT NULL
);

-- Create the Animal_Continents table to establish a many-to-many relationship
CREATE TABLE Animal_Continents (
    animal_id INT,
    continent_id INT,
    PRIMARY KEY (animal_id, continent_id),
    FOREIGN KEY (animal_id) REFERENCES Animals(id) ON DELETE CASCADE,
    FOREIGN KEY (continent_id) REFERENCES Continents(id) ON DELETE CASCADE
);
