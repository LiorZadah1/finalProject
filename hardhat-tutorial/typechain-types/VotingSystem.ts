/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "./common";

export interface VotingSystemInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "addOption"
      | "addVoter"
      | "admin"
      | "castVote"
      | "createVote"
      | "getAccessibleVotes"
      | "getOptionDetails"
      | "getOptionsCount"
      | "getVote"
      | "getVoteResults"
      | "nextVoteID"
      | "voteAdmins"
      | "votes"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "addOption",
    values: [BigNumberish, string]
  ): string;
  encodeFunctionData(
    functionFragment: "addVoter",
    values: [BigNumberish, AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "admin", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "castVote",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "createVote",
    values: [
      BigNumberish,
      string,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      string[]
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getAccessibleVotes",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getOptionDetails",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getOptionsCount",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getVote",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getVoteResults",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "nextVoteID",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "voteAdmins",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "votes", values: [BigNumberish]): string;

  decodeFunctionResult(functionFragment: "addOption", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "addVoter", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "admin", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "castVote", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "createVote", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getAccessibleVotes",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOptionDetails",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOptionsCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getVote", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getVoteResults",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "nextVoteID", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "voteAdmins", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "votes", data: BytesLike): Result;
}

export interface VotingSystem extends BaseContract {
  connect(runner?: ContractRunner | null): VotingSystem;
  waitForDeployment(): Promise<this>;

  interface: VotingSystemInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  addOption: TypedContractMethod<
    [voteID: BigNumberish, optionName: string],
    [void],
    "nonpayable"
  >;

  addVoter: TypedContractMethod<
    [voteID: BigNumberish, voterAddress: AddressLike, groupId: BigNumberish],
    [void],
    "nonpayable"
  >;

  admin: TypedContractMethod<[], [string], "view">;

  castVote: TypedContractMethod<
    [voteID: BigNumberish, optionIndex: BigNumberish],
    [void],
    "nonpayable"
  >;

  createVote: TypedContractMethod<
    [
      voteID: BigNumberish,
      voteName: string,
      startTime: BigNumberish,
      duration: BigNumberish,
      groupId: BigNumberish,
      voting_options: string[]
    ],
    [void],
    "nonpayable"
  >;

  getAccessibleVotes: TypedContractMethod<
    [groupId: BigNumberish],
    [
      [bigint[], string[], bigint[], bigint[], boolean[]] & {
        voteIDs: bigint[];
        voteNames: string[];
        startVoteTimes: bigint[];
        durations: bigint[];
        openStatuses: boolean[];
      }
    ],
    "view"
  >;

  getOptionDetails: TypedContractMethod<
    [voteID: BigNumberish, optionIndex: BigNumberish],
    [[string, bigint] & { optionName: string; countOption: bigint }],
    "view"
  >;

  getOptionsCount: TypedContractMethod<
    [voteID: BigNumberish],
    [bigint],
    "view"
  >;

  getVote: TypedContractMethod<
    [voteID: BigNumberish],
    [
      [string, bigint, bigint, bigint, bigint, boolean] & {
        voteName: string;
        voteID2: bigint;
        startVoteTime: bigint;
        duration: bigint;
        optionsCount: bigint;
        open: boolean;
      }
    ],
    "view"
  >;

  getVoteResults: TypedContractMethod<
    [voteID: BigNumberish, optionsCount: BigNumberish],
    [bigint[]],
    "view"
  >;

  nextVoteID: TypedContractMethod<[], [bigint], "view">;

  voteAdmins: TypedContractMethod<[arg0: BigNumberish], [string], "view">;

  votes: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [string, bigint, bigint, bigint, bigint, bigint, boolean] & {
        voteName: string;
        voteID: bigint;
        startVoteTime: bigint;
        duration: bigint;
        groupId: bigint;
        optionsCount: bigint;
        open: boolean;
      }
    ],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "addOption"
  ): TypedContractMethod<
    [voteID: BigNumberish, optionName: string],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "addVoter"
  ): TypedContractMethod<
    [voteID: BigNumberish, voterAddress: AddressLike, groupId: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "admin"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "castVote"
  ): TypedContractMethod<
    [voteID: BigNumberish, optionIndex: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "createVote"
  ): TypedContractMethod<
    [
      voteID: BigNumberish,
      voteName: string,
      startTime: BigNumberish,
      duration: BigNumberish,
      groupId: BigNumberish,
      voting_options: string[]
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getAccessibleVotes"
  ): TypedContractMethod<
    [groupId: BigNumberish],
    [
      [bigint[], string[], bigint[], bigint[], boolean[]] & {
        voteIDs: bigint[];
        voteNames: string[];
        startVoteTimes: bigint[];
        durations: bigint[];
        openStatuses: boolean[];
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getOptionDetails"
  ): TypedContractMethod<
    [voteID: BigNumberish, optionIndex: BigNumberish],
    [[string, bigint] & { optionName: string; countOption: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "getOptionsCount"
  ): TypedContractMethod<[voteID: BigNumberish], [bigint], "view">;
  getFunction(
    nameOrSignature: "getVote"
  ): TypedContractMethod<
    [voteID: BigNumberish],
    [
      [string, bigint, bigint, bigint, bigint, boolean] & {
        voteName: string;
        voteID2: bigint;
        startVoteTime: bigint;
        duration: bigint;
        optionsCount: bigint;
        open: boolean;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getVoteResults"
  ): TypedContractMethod<
    [voteID: BigNumberish, optionsCount: BigNumberish],
    [bigint[]],
    "view"
  >;
  getFunction(
    nameOrSignature: "nextVoteID"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "voteAdmins"
  ): TypedContractMethod<[arg0: BigNumberish], [string], "view">;
  getFunction(
    nameOrSignature: "votes"
  ): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [string, bigint, bigint, bigint, bigint, bigint, boolean] & {
        voteName: string;
        voteID: bigint;
        startVoteTime: bigint;
        duration: bigint;
        groupId: bigint;
        optionsCount: bigint;
        open: boolean;
      }
    ],
    "view"
  >;

  filters: {};
}
