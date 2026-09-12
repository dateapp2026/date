// Package matching provides stable-matching primitives over the app's
// social graph.
//
// StableMatch implements proposer-optimal deferred-acceptance Gale-Shapley.
// PreferencesFromLikes builds real preference lists from existing swipe
// history. Neither is wired into any handler yet — how a stable-matching
// round gets triggered, which users end up as "proposers" vs "receivers",
// and how results reach the app are deliberately left open.
package matching

// UserID identifies a user; matches models.User.ID (a UUID string).
type UserID = string

// StableMatch runs proposer-optimal deferred-acceptance Gale-Shapley.
//
// proposerPrefs[p] and receiverPrefs[r] are each person's full ranked
// preference list over the other side, most-preferred first. An entry
// missing from a receiver's list is treated as unacceptable to that
// receiver; only IDs present in proposers/receivers are considered.
//
// The result is proposer-optimal and stable but not receiver-optimal:
// every proposer gets the best receiver available to them under some
// stable matching, while receivers get their worst stable outcome.
// Proposers with no acceptable/available receiver are omitted from the
// result, as are receivers who end up unmatched.
//
// Splitting a single user pool into two sides for a run (e.g. by
// orientation/preference compatibility) is the caller's decision — this
// engine only runs the procedure on whatever two sides it's given.
func StableMatch(proposers, receivers []UserID, proposerPrefs, receiverPrefs map[UserID][]UserID) map[UserID]UserID {
	receiverSet := make(map[UserID]bool, len(receivers))
	for _, r := range receivers {
		receiverSet[r] = true
	}

	// receiverRank[r][p] is p's position in r's preference list (lower is better).
	receiverRank := make(map[UserID]map[UserID]int, len(receivers))
	for _, r := range receivers {
		rank := make(map[UserID]int, len(receiverPrefs[r]))
		for i, p := range receiverPrefs[r] {
			rank[p] = i
		}
		receiverRank[r] = rank
	}

	nextProposal := make(map[UserID]int, len(proposers))    // index into proposer's pref list
	receiverMatch := make(map[UserID]UserID, len(receivers)) // receiver -> current proposer

	free := make([]UserID, len(proposers))
	copy(free, proposers)

	for len(free) > 0 {
		p := free[len(free)-1]
		free = free[:len(free)-1]

		prefs := proposerPrefs[p]
		idx := nextProposal[p]
		for idx < len(prefs) && !receiverSet[prefs[idx]] {
			idx++
		}
		if idx >= len(prefs) {
			nextProposal[p] = idx
			continue // p has no one left to propose to
		}

		r := prefs[idx]
		nextProposal[p] = idx + 1

		rank, acceptable := receiverRank[r][p]
		if !acceptable {
			free = append(free, p)
			continue
		}

		current, taken := receiverMatch[r]
		switch {
		case !taken:
			receiverMatch[r] = p
		case receiverRank[r][current] > rank:
			// p is preferred by r over its current holder.
			receiverMatch[r] = p
			free = append(free, current)
		default:
			// r prefers its current holder; p stays free.
			free = append(free, p)
		}
	}

	result := make(map[UserID]UserID, len(receiverMatch))
	for r, p := range receiverMatch {
		result[p] = r
	}
	return result
}
