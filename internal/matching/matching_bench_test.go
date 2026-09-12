package matching

import (
	"fmt"
	"math/rand"
	"testing"
)

// generatePool builds n proposers and n receivers, each with a full,
// randomly shuffled preference list over the other side — a worst-case-ish
// input for Gale-Shapley (no shared structure to shortcut the search).
func generatePool(n int, seed int64) (proposers, receivers []UserID, proposerPrefs, receiverPrefs map[UserID][]UserID) {
	rng := rand.New(rand.NewSource(seed))

	proposers = make([]UserID, n)
	receivers = make([]UserID, n)
	for i := 0; i < n; i++ {
		proposers[i] = fmt.Sprintf("p%d", i)
		receivers[i] = fmt.Sprintf("r%d", i)
	}

	shuffled := func(ids []UserID) []UserID {
		out := make([]UserID, len(ids))
		copy(out, ids)
		rng.Shuffle(len(out), func(i, j int) { out[i], out[j] = out[j], out[i] })
		return out
	}

	proposerPrefs = make(map[UserID][]UserID, n)
	for _, p := range proposers {
		proposerPrefs[p] = shuffled(receivers)
	}
	receiverPrefs = make(map[UserID][]UserID, n)
	for _, r := range receivers {
		receiverPrefs[r] = shuffled(proposers)
	}

	return proposers, receivers, proposerPrefs, receiverPrefs
}

func BenchmarkStableMatch(b *testing.B) {
	for _, n := range []int{100, 1000, 2000} {
		b.Run(fmt.Sprintf("n=%d", n), func(b *testing.B) {
			proposers, receivers, proposerPrefs, receiverPrefs := generatePool(n, 42)
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				StableMatch(proposers, receivers, proposerPrefs, receiverPrefs)
			}
		})
	}
}
