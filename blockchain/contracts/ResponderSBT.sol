// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ResponderSBT is ERC721, Ownable {
    uint256 public nextTokenId = 1;

    struct BadgeInfo {
        string tier; // "HERO", "GUARDIAN", "HELPER"
        uint256 score;
        address responder;
    }

    mapping(uint256 => BadgeInfo) public badgeData;
    mapping(address => uint256[]) public responderBadges;
    mapping(address => uint256) public totalScore;
    mapping(address => uint256) public totalResponses;

    string public heroURI;
    string public guardianURI;
    string public helperURI;

    constructor(
        string memory _heroURI, 
        string memory _guardianURI, 
        string memory _helperURI,
        address _admin
    ) ERC721("FireCareSBT", "FCSBT") Ownable(_admin) {
        heroURI = _heroURI;
        guardianURI = _guardianURI;
        helperURI = _helperURI;
    }

    // Assign SBT Badge based on score calculated by backend AI
    function assignBadge(address responder, uint256 score) external onlyOwner {
        require(score >= 60, "Score too low for a badge");

        string memory assignedTier;
        string memory uri;

        if (score >= 90) {
            assignedTier = "HERO";
            uri = heroURI;
        } else if (score >= 75) {
            assignedTier = "GUARDIAN";
            uri = guardianURI;
        } else {
            assignedTier = "HELPER";
            uri = helperURI;
        }

        uint256 tokenId = nextTokenId++;
        _safeMint(responder, tokenId);

        badgeData[tokenId] = BadgeInfo(assignedTier, score, responder);
        responderBadges[responder].push(tokenId);
        
        totalScore[responder] += score;
        totalResponses[responder] += 1;
    }

    function getResponderBadges(address responder) public view returns (uint256[] memory) {
        return responderBadges[responder];
    }

    function getResponderRank(address responder) public view returns (uint256 avgScore, uint256 count) {
        count = totalResponses[responder];
        if (count == 0) return (0, 0);
        avgScore = totalScore[responder] / count;
        return (avgScore, count);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        ownerOf(tokenId); // validates token exists
        
        string memory tier = badgeData[tokenId].tier;
        if (keccak256(bytes(tier)) == keccak256(bytes("HERO"))) return heroURI;
        if (keccak256(bytes(tier)) == keccak256(bytes("GUARDIAN"))) return guardianURI;
        return helperURI;
    }

    // Make it Soulbound (non-transferable)
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "Non-transferable SBT");
        return super._update(to, tokenId, auth);
    }
}
