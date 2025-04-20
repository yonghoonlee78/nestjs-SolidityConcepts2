import { expect } from 'chai';
import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

describe('Bank', function () {
  let contract: any;
  let owner: any;
  let otherAccount: any;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory('Bank');
    contract = await Contract.deploy();
    await contract.waitForDeployment();
  });

  describe('라이선스 및 Solidity 버전 검사', function () {
    it('컨트랙트에서 SPDX 주석으로 라이선스가 있어야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/Bank.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');
      expect(sourceCode.match(/\/\/ SPDX-License-Identifier:/)).to.not.be.null;
    });

    it('컨트랙트에서 Solidity 버전이 0.8.0 이상, 0.9.0 미만이어야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/Bank.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');

      const versionMatch = sourceCode.match(/pragma solidity\s+([^;]+);/);
      expect(versionMatch).to.not.be.null;

      const solidityVersion = versionMatch![1].trim();
      const validVersions = ['>=0.8.0 <0.9.0', '^0.8.0'];

      expect(validVersions.includes(solidityVersion)).to.be.true;
    });
  });

  describe('(상속) Bank는 Vault의 상속받은 기능을 사용할 수 있어야 합니다.', function () {
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
        expect(await contract.connect(owner).getCaller()).to.equal(
          owner.address
        );
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

  describe('이벤트(event) 검사', function () {
    it('이벤트 Withdrawn는 인자 (address indexed user, uint256 amount)와 함께 발생해야 합니다.', async function () {
      await contract.deposit({
        value: ethers.parseEther('10'),
      });

      const withdraw = await contract.withdraw(ethers.parseEther('1'));
      const receipt = await withdraw.wait();

      await expect(receipt)
        .to.emit(contract, 'Withdrawn')
        .withArgs(owner.address, ethers.parseEther('1'));
    });

    it('함수 withdraw는 uint256 타입을 인자로 받아 (1)sentValue에서 인자 값을 차감 후 (2)해당 인자 값 만큼 호출자에게 반환해야 합니다.', async function () {
      const depositAmount = ethers.parseEther('10');
      await contract.deposit({ value: depositAmount });

      const oldSentValue = await contract.sentValue();

      const withdrawAmount = ethers.parseEther('1');
      const tx = await contract.withdraw(withdrawAmount);

      await expect(tx)
        .to.emit(contract, 'Withdrawn')
        .withArgs(owner.address, withdrawAmount);

      const newSentValue = await contract.sentValue();
      expect(newSentValue).to.equal(oldSentValue - withdrawAmount);

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      expect(ownerBalanceAfter).to.be.above(oldSentValue);
    });

    it('함수 withdraw를 정상적으로 호출시 Withdrawn 이벤트가 발생해야 합니다.', async function () {
      await contract.deposit({
        value: ethers.parseEther('10'),
      });

      const withdraw = await contract.withdraw(ethers.parseEther('1'));
      const receipt = await withdraw.wait();

      await expect(receipt)
        .to.emit(contract, 'Withdrawn')
        .withArgs(owner.address, ethers.parseEther('1'));
    });
  });

  describe('접근 제어자(modifier) & 에러 처리(require) 검사', function () {
    it('modifier onlyOwner가 존재해야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/Bank.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');

      expect(sourceCode.match(/\bmodifier\s+onlyOwner\s*\(\)\s*\{/)).to.not.be
        .null;
    });

    it('onlyOwner modifier가 함수 withdraw에 적용되어야 합니다.', async function () {
      const contractPath = path.join(__dirname, '../contracts/Bank.sol');
      const sourceCode = fs.readFileSync(contractPath, 'utf8');

      expect(
        sourceCode.match(
          /\bfunction\s+\w+\s*\([^)]*\)\s+public\s+onlyOwner\s*\{/
        )
      ).to.not.be.null;
    });

    it('modifier onlyOwner는 소유자(owner)가 아닌 경우 "Only the owner can call withdraw."를 에러로 출력(require)해야 합니다.', async function () {
      await expect(
        contract.connect(otherAccount).withdraw(ethers.parseEther('1'))
      ).to.be.revertedWith('Only the owner can call withdraw.');
    });

    it('함수 withdraw는 인자로 들어오는 값이 sentValue를 초과할 경우 "Insufficient balance in Vault."를 에러로 출력해야 합니다.', async function () {
      await contract.deposit({
        value: ethers.parseEther('10'),
      });

      await expect(
        contract.connect(owner).withdraw(ethers.parseEther('11'))
      ).to.be.revertedWith('Insufficient balance in Vault.');
    });
  });
});
