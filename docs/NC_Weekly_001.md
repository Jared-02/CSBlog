---
title: 'NowCoder Weekly Contest Review #001'
description: 'NC Weekly Review 001'
pubDate: '2026-02-08'
tags: ['OI/ICPC']
---

> https://ac.nowcoder.com/acm/contest/127702 <br>
> 本文给出代码在 nowcoder 使用 pypy3 环境均可 AC

## [A. 红美铃的访客登记](https://ac.nowcoder.com/acm/contest/127702/A)

### 题目分析
给定一个由数字字符组成的字符串 $s$（可能含有前导零），输出去掉前导零后的整数。

### 解题思路

编程语言题，Python 只要 `int()` 强制转换就可以，C++ 要考虑的就多了，可以用 `find_first_not_of('0')` 手动定位第一个非零字符。

### Code
```py
import sys
input = sys.stdin.readline

def solve():
    n = int(input().strip())
    print(n)
solve()
```

## [B. 爱丽丝的魔力零件分类](https://ac.nowcoder.com/acm/contest/127702/B)
> 模拟

### 题目分析
给定 $n \times n$ 的网格，其中恰好有 4 个 `*` 构成一个四连通的 T 型或 L 型零件（含旋转翻转）。判断它是 T 型还是 L 型。

### 解题思路
通过观察 T 型和 L 型的本质区别来简化逻辑，关键在每个`*`连通了几个`*`，只有 T 型中间的`*`连接了 3 个`*`，否则是 L 型。

如何更简单的实现该遍历，是下一个难点。赛时我使用了一个数组/列表存放`*`，然后遍历数组先找到 3 个`*`连成的一条线，再查看中间`*`的上下/左右是否还存在 1 个`*`。但实际上这种遍历的边界处理极难维护，不如探寻其数学本质——坐标。

输入时提取 4 个`*`的坐标放入一个集合 star，对每个坐标都做上、下、左、右移动，产生 4 个邻居坐标。如果有 3 个都在 star 中，说明它就是 T 型，完全回避了边界处理的困难。
### Code
```py
import sys
input = sys.stdin.readline

def solve():
    star = set() # sort O(1)
    n = int(input())
    for y in range(n):
        a = str(input().strip())
        for x, v in enumerate(a):
            if v == '*':
                star.add((x, y))

    direct = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    for x, y in star:
        cnt = 0
        for i in range(4):
            xm, ym = direct[i]
            pos = (x + xm, y + ym)
            if pos in star:
                cnt += 1
            if cnt == 3:
                print('T')
                return
    print('L')

T = int(input().strip())
for _ in range(T):
    solve()
```
## [C. 博丽大结界的稳定轴心](https://ac.nowcoder.com/acm/contest/127702/C)
> 二叉树

### 题目分析
给定一棵 $n$ 个节点的无根树（$n-1$ 条边），求有多少个节点 $r$ 可以作为根，使得以 $r$ 为根时这棵树是一棵合法的**二叉树**（每个节点最多 2 个子节点）。

### 解题思路
本题需要理解二叉树的性质。不需要建树或 DFS，而是理解“根节点”的性质。要找到所有能建立合法二叉树的根节点 $r$，我们应该观察其能连接的子节点数（度数）。

当一个节点 $v$ 被选为根时，它的边全部连向子节点（没有父），所以度数应 $\leq 2$；而非根节点一条边连向父，其余边连向子节点，所以需要度数 $\leq 3$（即最多 2 个子节点）。

因此判定逻辑为：
- 若存在度数 $\geq 4$ 的节点，无论谁做根，该节点都至少有 3 个子节点，不合法，答案为 0
- 度数 $= 3$ ，只能是子节点
- 度数 $\leq 2$ ，可以是根节点
- 特判：$n = 1$ 时，只有一个节点，答案为 1

### Code
```py
import sys
input = sys.stdin.readline

def solve():
    n = int(input())
    if n == 1:
        print(1)
        return
    cnt = {}
    for _ in range(n - 1):
        u, v = map(int, input().split())
        for i in [u, v]:
            if i in cnt:
                cnt[i] += 1
                if cnt.get(i) >= 4:
                    print(0)
                    return
            else:
                cnt[i] = 1
    res = 0
    for k, v in cnt.items():
        if v <= 2:
            res += 1
    print(res)

solve()
```

## [D. 魔法人偶的十进制校准](https://ac.nowcoder.com/acm/contest/127702/D)
> 构造

### 题目分析
给定整数 $a$ 和 $b$（$1 \leq a \leq 10^9$，$0 \leq b \leq 9$），构造一个最简真分数 $x/y$（$1 \leq x < y \leq 10^3$，$\gcd(x,y)=1$），使得 $x/y$ 的十进制小数展开中第 $a$ 位恰好为 $b$。

### 解题思路

核心思路是利用**循环小数**的性质。如果能构造一个循环节中包含 $b$ 的分数，并让第 $a$ 位恰好落在 $b$ 上，问题就解决了。

分情况讨论：

1. **$b = 0$ 时**：需要小数第 $a$ 位为 0。
    - 若 $a > 1$，取 $x/y = 1/2 = 0.5000\ldots$，第 2 位及之后全为 0，满足条件。
    - 若 $a = 1$，第 1 位就要是 0，取 $x/y = 1/11 = 0.090909\ldots$，第 1 位为 0。

2. **$b = 9$ 时**：需要小数第 $a$ 位为 9。
    > 这里要求真分数 $x < y$，不可以构造 $1/1 = 0.999\ldots$
    - 若 $a$ 为奇数，取 $x/y = 10/11 = 0.909090\ldots$，奇数位为 9。
    - 若 $a$ 为偶数，取 $x/y = 1/11 = 0.090909\ldots$，偶数位为 9。

3. **$1 \leq b \leq 8$ 时**：观察 $b/9$ 的小数展开。例如 $3/9 = 0.333\ldots$，$7/9 = 0.777\ldots$，即 $b/9 = 0.\overline{b}$，每一位都是 $b$。因此第 $a$ 位必然是 $b$。只需约分 $b/9$ 即可得到最简分数。

### Code
```py
import sys, math
input = sys.stdin.readline

def solve():
    a, b = map(int, input().split())
    if b == 0:
        if a > 1:
            print(1, 2)
        else:
            print(1, 11)
    elif b == 9:
        if a % 2 != 0:
            print(10, 11)
        else:
            print(1, 11)
    elif 1 <= b <= 8:
        x = b
        g = math.gcd(x, 9)
        print(x // g, 9 // g)

T = int(input().strip())
for _ in range(T):
    solve()
```
