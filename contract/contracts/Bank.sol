// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Vault.sol";

contract Bank is Vault {
    // 이벤트 정의
    event Withdrawn(address indexed user, uint256 amount);
    
    // modifier 정의
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call withdraw.");
        _;
    }
    
    // 생성자 - 부모 생성자가 자동으로 호출되어 owner 설정됨
    constructor() {}
    
    // withdraw 함수 - 소유자만 호출 가능, 지정된 금액만큼 출금
    function withdraw(uint256 amount) public onlyOwner {
        require(amount <= sentValue, "Insufficient balance in Vault.");
        
        sentValue -= amount;
        
        // 이더 전송
        payable(msg.sender).transfer(amount);
        
        // 이벤트 발생
        emit Withdrawn(msg.sender, amount);
    }
}