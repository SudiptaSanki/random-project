// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract EmergencyRegistry is Ownable {
    enum Status { PENDING, RESPONDING, RESOLVED, CANCELLED }

    struct Emergency {
        uint256 id;
        string locationHash; // GeoHash or IPFS CID
        string severity; // "MINOR" or "MAJOR"
        Status status;
        address[] responders;
        uint256 timestamp;
    }

    mapping(uint256 => Emergency) public emergencies;
    uint256 public nextEmergencyId = 1;

    event EmergencyCreated(uint256 indexed id, string severity, string locationHash);
    event EmergencyResolved(uint256 indexed id);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function createEmergency(string memory _locationHash, string memory _severity) external onlyOwner returns (uint256) {
        uint256 id = nextEmergencyId++;
        emergencies[id] = Emergency({
            id: id,
            locationHash: _locationHash,
            severity: _severity,
            status: Status.PENDING,
            responders: new address[](0),
            timestamp: block.timestamp
        });

        emit EmergencyCreated(id, _severity, _locationHash);
        return id;
    }

    function addResponder(uint256 _id, address _responder) external onlyOwner {
        require(emergencies[_id].id != 0, "Emergency does not exist");
        emergencies[_id].responders.push(_responder);
        if (emergencies[_id].status == Status.PENDING) {
            emergencies[_id].status = Status.RESPONDING;
        }
    }

    function resolveEmergency(uint256 _id) external onlyOwner {
        require(emergencies[_id].id != 0, "Emergency does not exist");
        emergencies[_id].status = Status.RESOLVED;
        emit EmergencyResolved(_id);
    }

    function getResponders(uint256 _id) external view returns (address[] memory) {
        return emergencies[_id].responders;
    }
}
