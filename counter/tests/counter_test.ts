import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types,
} from "https://deno.land/x/clarinet@v1.7.1/index.ts";
import { assertEquals } from "https://deno.land/std@0.170.0/testing/asserts.ts";

Clarinet.test({
  name: "get-count returns u0 for principals that never called count-up before",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let count = chain.callReadOnlyFn(
      "counter",
      "get-count",
      [types.principal(deployer.address)],
      deployer.address
    );
    count.result.expectUint(0);
  },
});

Clarinet.test({
  name: "count-up counts up for the tx-sender",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let block = chain.mineBlock([
      Tx.contractCall("counter", "count-up", [], deployer.address),
    ]);
    let [receipt] = block.receipts;
    receipt.result.expectOk().expectBool(true);
    let count = chain.callReadOnlyFn(
      "counter",
      "get-count",
      [types.principal(deployer.address)],
      deployer.address
    );
    count.result.expectUint(1);
  },
});

Clarinet.test({
  name: "counters are specific to the tx-sender",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    let deployer = accounts.get("deployer")!;
    let wallet1 = accounts.get("wallet_1")!;
    let wallet2 = accounts.get("wallet_2")!;

    let block = chain.mineBlock([
      Tx.contractCall("counter", "count-up", [], wallet1.address),
      Tx.contractCall("counter", "count-up", [], wallet2.address),
      Tx.contractCall("counter", "count-up", [], wallet2.address),
    ]);

    let [receipt] = block.receipts;
    receipt.result.expectOk().expectBool(true);

    let deployerCount = chain.callReadOnlyFn(
      "counter",
      "get-count",
      [types.principal(deployer.address)],
      deployer.address
    );
    deployerCount.result.expectUint(0);

    let wallet1Count = chain.callReadOnlyFn(
      "counter",
      "get-count",
      [types.principal(wallet1.address)],
      wallet1.address
    );
    wallet1Count.result.expectUint(1);

    let wallet2Count = chain.callReadOnlyFn(
      "counter",
      "get-count",
      [types.principal(wallet2.address)],
      wallet2.address
    );
    wallet2Count.result.expectUint(2);
  },
});
