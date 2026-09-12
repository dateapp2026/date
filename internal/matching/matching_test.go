package matching

import "testing"

func TestStableMatch_MutualTopChoice(t *testing.T) {
	proposers := []UserID{"A", "B"}
	receivers := []UserID{"X", "Y"}
	proposerPrefs := map[UserID][]UserID{
		"A": {"X", "Y"},
		"B": {"X", "Y"},
	}
	receiverPrefs := map[UserID][]UserID{
		"X": {"B", "A"},
		"Y": {"A", "B"},
	}

	got := StableMatch(proposers, receivers, proposerPrefs, receiverPrefs)
	want := map[UserID]UserID{"A": "Y", "B": "X"}
	assertMatchEqual(t, got, want)
}

func TestStableMatch_UnanimousRanking(t *testing.T) {
	proposers := []UserID{"A", "B", "C"}
	receivers := []UserID{"X", "Y", "Z"}
	order := []UserID{"X", "Y", "Z"}
	proposerPrefs := map[UserID][]UserID{"A": order, "B": order, "C": order}
	receiverOrder := []UserID{"A", "B", "C"}
	receiverPrefs := map[UserID][]UserID{"X": receiverOrder, "Y": receiverOrder, "Z": receiverOrder}

	got := StableMatch(proposers, receivers, proposerPrefs, receiverPrefs)
	want := map[UserID]UserID{"A": "X", "B": "Y", "C": "Z"}
	assertMatchEqual(t, got, want)
}

func TestStableMatch_UnequalSizesLeavesOneUnmatched(t *testing.T) {
	proposers := []UserID{"A", "B", "C"}
	receivers := []UserID{"X", "Y"}
	order := []UserID{"X", "Y"}
	proposerPrefs := map[UserID][]UserID{"A": order, "B": order, "C": order}
	receiverOrder := []UserID{"A", "B", "C"}
	receiverPrefs := map[UserID][]UserID{"X": receiverOrder, "Y": receiverOrder}

	got := StableMatch(proposers, receivers, proposerPrefs, receiverPrefs)
	want := map[UserID]UserID{"A": "X", "B": "Y"}
	assertMatchEqual(t, got, want)
	if _, matched := got["C"]; matched {
		t.Fatalf("expected C to be unmatched, got %v", got)
	}
}

func TestStableMatch_UnacceptableReceiverIsSkipped(t *testing.T) {
	proposers := []UserID{"A"}
	receivers := []UserID{"X", "Y"}
	proposerPrefs := map[UserID][]UserID{"A": {"X", "Y"}}
	receiverPrefs := map[UserID][]UserID{
		"X": {}, // X doesn't rank A at all -> unacceptable
		"Y": {"A"},
	}

	got := StableMatch(proposers, receivers, proposerPrefs, receiverPrefs)
	want := map[UserID]UserID{"A": "Y"}
	assertMatchEqual(t, got, want)
}

func TestStableMatch_EmptyInput(t *testing.T) {
	got := StableMatch(nil, nil, nil, nil)
	if len(got) != 0 {
		t.Fatalf("expected empty result, got %v", got)
	}
}

func assertMatchEqual(t *testing.T, got, want map[UserID]UserID) {
	t.Helper()
	if len(got) != len(want) {
		t.Fatalf("got %v, want %v", got, want)
	}
	for p, r := range want {
		if got[p] != r {
			t.Fatalf("got %v, want %v", got, want)
		}
	}
}
