import { expect } from 'chai';
import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

describe('Vault', function () {
  let contract: any;
  let owner: any;
  let otherAccount: any;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory('Vault');
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  describe('라이선스 및 Solidity 버전 검사', function () {
    it('컨트랙트에서 SPDX 주석으로 라이선스가 있어야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/Vault.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');
      expect(sourceCode.match(/\/\/ SPDX-License-Identifier:/)).to.not.be.null;
    });

    it('컨트랙트에서 Solidity 버전이 0.8.0 이상, 0.9.0 미만이어야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/Vault.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');

      const versionMatch = sourceCode.match(/pragma solidity\s+([^;]+);/);
      expect(versionMatch).to.not.be.null;

      const solidityVersion = versionMatch![1].trim();
      const validVersions = ['>=0.8.0 <0.9.0', '^0.8.0'];

      expect(validVersions.includes(solidityVersion)).to.be.true;
    });
  });

  describe('상태 변수 검사', function () {
    it('address 타입의 public 상태변수 owner 의 값은 배포자의 주소여야 합니다.', async function () {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it('uint256 타입의 public 상태변수 sentValue 가 선언되어야 합니다.', async function () {
      expect(await contract.sentValue()).to.equal(0);
    });

    it('uint256 타입의 public 상태변수 timestamp 가 선언되어야 합니다.', async function () {
      expect(await contract.timestamp()).to.equal(0);
    });

    it('uint256 타입의 public 상태변수 gasUsed 가 선언되어야 합니다.', async function () {
      expect(await contract.gasUsed()).to.equal(0);
    });
  });

  describe('함수 검사', function () {
    it('함수 deposit을 호출하면 sentValue는 "호출 시 전송된 이더(코인)의 양 (wei 단위)", timestamp는 "현재 블록이 생성된 시간"이 저장되어야 합니다.', async function () {
      const depositAmount = ethers.parseEther('1');
      const tx = await contract
        .connect(otherAccount)
        .deposit({ value: depositAmount });
      await tx.wait();

      expect(await contract.sentValue()).to.equal(depositAmount);
      expect(await contract.timestamp()).to.be.greaterThan(0);
    });

    it('함수 deposit을 호출 시 보내는 이더(코인)의 양이 0 이하일 시 "Must send some ether." 에러를 출력해야 합니다.', async function () {
      await expect(
        contract.connect(owner).deposit({ value: 0 })
      ).to.be.revertedWith('Must send some ether.');
    });

    it('함수 getCaller는 호출자의 주소를 리턴해야 합니다.', async function () {
      expect(await contract.connect(otherAccount).getCaller()).to.equal(
        otherAccount.address
      );
      expect(await contract.connect(owner).getCaller()).to.equal(owner.address);
    });

    it('함수 getOrigin은 트랜잭션을 시작한 외부 계정 주소를 반환해야 합니다.', async function () {
      expect(await contract.connect(otherAccount).getOrigin()).to.equal(
        otherAccount.address
      );
    });

    it('함수 getBlockDetails는 호출 시 현재 블록 정보 값(\n          현재 블록의 번호(uint), \n          이전 블록의 난수(uint) 값,\n          현재 블록의 가스 한도(uint),\n          현재 블록을 채굴한 채굴자의 주소(address)\n        )을 반환해야 합니다.', async function () {
      const blockDetails = await contract.getBlockDetails();
      expect(blockDetails[0]).to.be.a('bigint');
      expect(blockDetails[1]).to.be.a('bigint');
      expect(blockDetails[2]).to.be.a('bigint');
      expect(blockDetails[3]).to.be.properAddress;
    });

    it('함수 trackGasUsage 호출 시 gasleft()를 사용하여 초기 가스 값과 최종 가스 값의 차이를 계산하고, 이를 상태 변수 gasUsed에 저장해야 합니다.', async function () {
      await contract.trackGasUsage();
      expect(await contract.gasUsed()).to.be.greaterThan(0);
    });

    it('함수 generateHash는 string 타입을 인자(string)로 받아 keccak256 해시 값(bytes32)을 리턴해야 합니다.', async function () {
      const testString = 'Hello, insu!';
      const hashValue = await contract.generateHash(testString);
      expect(hashValue).to.equal(
        ethers.keccak256(ethers.toUtf8Bytes(testString))
      );
    });
  });
});
