---
title: 'CodeForces Problem Review #001'
description: 'CF Problem Review #001'
pubDate: '2026-02-11'
tags: ['OI/ICPC']
---
> 本文给出的 Python 代码使用 PyPy3 环境均可 AC

## [A Friendly Numbers](https://codeforces.com/problemset/problem/2197/A)
> 同余，枚举

### 题目分析
给定一个正整数 $x$ $(1 \le x \le 10^9)$，我们需要确定有多少个正整数 $y$ 满足 $y - d(y) = x$，其中 $d(y)$ 是 $y$ 的各位数字之和。
题目包含 $t$ 组测试用例 $(1 \le t \le 500)$。

> $x$ 最大可达 $10^9$，如果对于每个测试用例从 $1$ 开始无限枚举 $y$ 肯定会 TLE。

### 解题思路
> 如果你具备基本的数论知识，一个数与它的各位数字之和同余：$y \equiv d(y) \pmod 9$。因此，$y - d(y)$ 必定是 $9$ 的倍数。所以如果给定的 $x$ 不是 $9$ 的倍数，答案直接为 $0$。

暴力枚举分析，先 $1 \sim 1000$ 枚举 $y$ 可以发现得到的 $x$ 都是 $9$ 的倍数，且只有 $9$ 的倍数有 $10$ 个满足条件的 $y$，其他都是 $0$ 个。测试样例通过，提交！WA。 ~~再尝试枚举 1e9 附近的边界，寻找可能的例外情况，无果。~~ 

接着反向确认是否**所有** $9$ 的倍数都在预处理的 $x$ 表中，注意到：
```text
[90, 189, 288, 387, 486, 585, 684, 783, 882, 981, 990, 1089, 1188, 1287, 1386, 1485, 1584, 1683, 1782, 1881, 1980, 1989, 1998 ...]
```
这些 $9$ 的倍数都不在表中（也就是说它们对应 $0$ 个 $y$）。笔者进一步想找到它们间的数学关系，可惜注意力低下，遂考虑枚举：

因为 $y - d(y) = x$，即 $y = x + d(y)$。对于 $x \le 10^9$，$y$ 的各位数之和 $d(y)$ 最大不超过 $9 \times 9 = 81$。这意味着满足条件的 $y$ 必定出现在 $[x, x+81]$ 的极小范围内！保守起见我们枚举 $[x, x+99]$，在此范围内如果出现某个 $y$ 满足 $y - d(y) = x$，那么 $x$ 就一定存在 $10$ 个解。

考虑到 $t \le 500$，时间复杂度 $O(100 \times t)$ 极其充足。
> PS: C++ 每秒操作 $10^8$ 次，PyPy 每秒操作 $10^7$ 次以上。面对小范围区间时，果断暴力！

### Code
```py
import sys
input = sys.stdin.readline

def solve():
    x = int(input().strip())
    if x % 9 == 0:
        for i in range(x, x + 100):
            di = sum(int(k) for k in str(i))
            if i - di == x:
                print(10)
                return
    print(0)

T = int(input().strip())
for _ in range(T):
    solve()
```
```cpp
#include <bits/stdc++.h>
#define endl '\n'
using namespace std;
using LL = long long;

void solve() {
    LL x;
    cin >> x;
    if(x % 9 == 0){
        for(LL i = x; i < x+100; i++){
            int di = 0;
            LL tmp = i;
            while(tmp){
                di += tmp % 10;
                tmp /= 10;
            };
            if(i - di == x){
                cout << 10 << endl;
                return;
            }
        }
    }
    cout << 0 << endl;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int T;
    cin >> T;
    while (T --) {
        solve();
    }
    return 0;
}
```

## [B Array and Permutation](https://codeforces.com/problemset/problem/2197/B)
> 思维，不变量

### 题目分析
给定一个长度为 $n$ 的排列 $a$（包含 $1 \sim n$ 的所有整数各一次）和一个同长度的目标数组 $b$。
你每次操作可以选择排列中的两个**相邻**元素，把其中一个的值覆盖给另一个（相当于把一个元素向左或向右复制一格）。
问：能否通过若干次这种相邻复制操作，将初始排列 $a$ 变成目标数组 $b$？

> $n \le 2 \cdot 10^5$，总和不超过 $2 \cdot 10^5$，因此算法必须是 $O(n)$ 或 $O(n \log n)$ 的级别。

### 解题思路

题目要求判断能否从排列仅通过相邻移动操作得到数组。可以先列出几个示例：
```text
a: 1 2 3 4 5
b: 3 3 5 5 5  -> YES
b: 4 3 5 5 5  -> NO
```
可以注意到，因为只能覆盖**相邻**的元素，排列 $a$ 中后面的数字没有办法“跨过”其他数字出现在前面的位置。此例中数组 $b$ 能够成立的根本原因在于，保留下来的元素（此例中的 $3$ 和 $5$）在原始排列 $a$ 中的相对位置没有变化。

进一步推广可以发现，目标数组 $b$ 成立的充要条件是：**$b$ 中各个元素在原始排列 $a$ 中的原位置，必须是单调不减的。**
我们可以验证：
```text
  a: 6 2 1 4 5 3
  b: 2 2 4 5 3 3
pos: 2 2 4 5 6 6
```
（元素 $2$ 的位置是 $2$，元素 $4$ 的位置是 $4$ … 映射出的位置序列 `2 2 4 5 6 6` 单调不减）

立刻就有实现思路：
1. 先遍历一遍排列 $a$，创建记录每个数字原位置的数组 `pos`。
2. 然后遍历目标数组 $b$，检查 $b$ 中每个数字的 `pos` 是否都大于等于前一个。如果出现小于前一个的情况，直接 `break` 判为 `NO`。

本题的关键在于从错综复杂的复制操作中，敏锐地找出“元素相对位置单调”这一不变量。

### Code
```py
import sys
input = sys.stdin.readline

def solve():
    n = int(input().strip())
    a = list(map(int, input().split()))
    b = list(map(int, input().split()))
    pos = [0] * (n + 1)
    for i, v in enumerate(a, start=1):
        pos[v] = i
        
    prev = 0
    ok = True
    for x in b:
        cur = pos[x]
        if cur < prev:
            ok = False
            break
        prev = cur
    print('YES' if ok else 'NO')

T = int(input().strip())
for _ in range(T):
    solve()
```
