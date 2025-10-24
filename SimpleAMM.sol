// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleAMM {
    IERC20 public tokenA;
    IERC20 public tokenB;
    uint256 public reserveA;
    uint256 public reserveB;
    uint256 public totalLiquidity;
    mapping(address=>uint256) public liquidity;

    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB, uint256 liquidityMinted);
    event Swapped(address indexed trader, address tokenIn, uint256 amountIn, address tokenOut, uint256 amountOut);

    constructor(address _tokenA, address _tokenB) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external returns (uint256) {
        require(amountA > 0 && amountB > 0, "invalid amounts");
        require(tokenA.transferFrom(msg.sender, address(this), amountA), "transferA failed");
        require(tokenB.transferFrom(msg.sender, address(this), amountB), "transferB failed");

        uint256 liquidityMinted;
        if (totalLiquidity == 0) {
            liquidityMinted = sqrt(amountA * amountB);
        } else {
            uint256 liqA = (amountA * totalLiquidity) / reserveA;
            uint256 liqB = (amountB * totalLiquidity) / reserveB;
            liquidityMinted = liqA < liqB ? liqA : liqB;
        }

        require(liquidityMinted > 0, "insufficient liquidity minted");
        liquidity[msg.sender] += liquidityMinted;
        totalLiquidity += liquidityMinted;
        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB, liquidityMinted);
        return liquidityMinted;
    }

    function swapExactInput(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(amountIn > 0, "amountIn 0");
        bool inIsA = (tokenIn == address(tokenA));
        require(inIsA || tokenIn == address(tokenB), "invalid tokenIn");

        IERC20 inToken = inIsA ? tokenA : tokenB;
        IERC20 outToken = inIsA ? tokenB : tokenA;
        uint256 reserveIn = inIsA ? reserveA : reserveB;
        uint256 reserveOut = inIsA ? reserveB : reserveA;

        require(reserveIn > 0 && reserveOut > 0, "empty reserves");

        require(inToken.transferFrom(msg.sender, address(this), amountIn), "transferFrom failed");

        uint256 amountInWithFee = (amountIn * 997) / 1000;
        amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
        require(amountOut > 0, "insufficient output amount");

        if (inIsA) {
            reserveA += amountIn;
            reserveB -= amountOut;
        } else {
            reserveB += amountIn;
            reserveA -= amountOut;
        }

        require(outToken.transfer(msg.sender, amountOut), "transfer out failed");

        emit Swapped(msg.sender, tokenIn, amountIn, address(outToken), amountOut);
        return amountOut;
    }

    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
