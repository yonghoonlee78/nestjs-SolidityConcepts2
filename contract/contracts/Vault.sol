// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Vault {
    // 상태 변수들
    address public owner;
    uint256 public sentValue;
    uint256 public timestamp;
    uint256 public gasUsed;
    
    // 생성자 - 배포자를 owner로 설정
    constructor() {
        owner = msg.sender;
    }
    
    // deposit 함수 - 이더를 받아서 상태변수들을 업데이트
    function deposit() public payable {
        require(msg.value > 0, "Must send some ether.");
        
        sentValue = msg.value;
        timestamp = block.timestamp;
    }
    
    // 호출자의 주소를 반환
    function getCaller() public view returns (address) {
        return msg.sender;
    }
    
    // 트랜잭션을 시작한 외부 계정 주소를 반환
    function getOrigin() public view returns (address) {
        return tx.origin;
    }
    
    // 현재 블록의 상세 정보를 반환
    function getBlockDetails() public view returns (uint256, uint256, uint256, address) {
        return (
            block.number,        // 현재 블록 번호
            block.prevrandao,    // 이전 블록의 난수값 (Ethereum 2.0 이후)
            block.gaslimit,      // 현재 블록의 가스 한도
            block.coinbase       // 현재 블록을 채굴한 채굴자의 주소
        );
    }
    
    // 가스 사용량을 추적하고 저장
    function trackGasUsage() public {
        uint256 initialGas = gasleft();
        
        // 일부 연산을 수행하여 가스를 소모
        uint256 temp = 0;
        for(uint256 i = 0; i < 10; i++) {
            temp += i;
        }
        
        uint256 finalGas = gasleft();
        gasUsed = initialGas - finalGas;
    }
    
    // 문자열을 받아서 keccak256 해시값을 반환
    function generateHash(string memory input) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(input));
    }
}
