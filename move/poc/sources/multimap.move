// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module poc::multimap {

    use std::option::{Self, Option};
    use std::vector;

    /// This key already exists in the map
    const EKeyAlreadyExists: u64 = 0;

    /// This key does not exist in the map
    const EKeyDoesNotExist: u64 = 1;

    /// Trying to destroy a map that is not empty
    const EMapNotEmpty: u64 = 2;

    /// Trying to access an element of the map at an invalid index
    const EIndexOutOfBounds: u64 = 3;

    struct MultiMap<K: copy> has copy, drop, store {
        contents: vector<Entry<K>>,
    }

    /// An entry in the map
    struct Entry<K: copy> has copy, drop, store {
        key: K,
        priority: u64,
    }

    /// Create an empty `MultiMap`
    public fun empty<K: copy>(): MultiMap<K> {
        MultiMap { contents: vector::empty() }
    }

    /// Insert the entry `key` |-> `value` into `self`.
    /// Aborts if `key` is already bound in `self`.
    public fun insert<K: copy>(self: &mut MultiMap<K>, key: K, priority: u64) {
        assert!(!contains(self, &key), EKeyAlreadyExists);
        let len = vector::length(&self.contents);
        if (len == 0) {
            vector::push_back(&mut self.contents, Entry { key, priority });
        } else {
            let (lo, hi) = (0, len);
            while (lo < hi) {
                let mid = (hi - lo) / 2 + lo;
                let ele = vector::borrow(&self.contents, mid);
                if (priority > ele.priority) {
                    hi = mid;
                } else {
                    lo = mid + 1;
                }
            };
            vector::insert(&mut self.contents, Entry { key, priority }, lo);
        }
    }

    /// Remove the entry `key` |-> `value` from self. Aborts if `key` is not bound in `self`.
    public fun remove<K: copy>(self: &mut MultiMap<K>, key: &K): (K, u64) {
        let idx = get_idx(self, key);
        let Entry { key, priority } = vector::remove(&mut self.contents, idx);
        (key, priority)
    }

    /// Get a mutable reference to the value bound to `key` in `self`.
    /// Aborts if `key` is not bound in `self`.
    public fun get_mut<K: copy>(self: &mut MultiMap<K>, key: &K): &mut u64 {
        let idx = get_idx(self, key);
        let entry = vector::borrow_mut(&mut self.contents, idx);
        &mut entry.priority
    }

    /// Get a reference to the value bound to `key` in `self`.
    /// Aborts if `key` is not bound in `self`.
    public fun get<K: copy>(self: &MultiMap<K>, key: &K): &u64 {
        let idx = get_idx(self, key);
        let entry = vector::borrow(&self.contents, idx);
        &entry.priority
    }

    /// Safely try borrow a value bound to `key` in `self`.
    /// Return Some(V) if the value exists, None otherwise.
    /// Only works for a "copyable" value as references cannot be stored in `vector`.
    public fun try_get<K: copy>(self: &MultiMap<K>, key: &K): Option<u64> {
        if (contains(self, key)) {
            option::some(*get(self, key))
        } else {
            option::none()
        }
    }

    /// Return true if `self` contains an entry for `key`, false otherwise
    public fun contains<K: copy>(self: &MultiMap<K>, key: &K): bool {
        option::is_some(&get_idx_opt(self, key))
    }

    /// Return the number of entries in `self`
    public fun size<K: copy>(self: &MultiMap<K>): u64 {
        vector::length(&self.contents)
    }

    /// Return true if `self` has 0 elements, false otherwise
    public fun is_empty<K: copy>(self: &MultiMap<K>): bool {
        size(self) == 0
    }

    /// Destroy an empty map. Aborts if `self` is not empty
    public fun destroy_empty<K: copy>(self: MultiMap<K>) {
        let MultiMap { contents } = self;
        assert!(vector::is_empty(&contents), EMapNotEmpty);
        vector::destroy_empty(contents)
    }

    /// Find the index of `key` in `self`. Return `None` if `key` is not in `self`.
    /// Note that map entries are stored in insertion order, *not* sorted by key.
    public fun get_idx_opt<K: copy>(self: &MultiMap<K>, key: &K): Option<u64> {
        let i = 0;
        let n = size(self);
        while (i < n) {
            if (&vector::borrow(&self.contents, i).key == key) {
                return option::some(i)
            };
            i = i + 1;
        };
        option::none()
    }

    /// Find the index of `key` in `self`. Aborts if `key` is not in `self`.
    /// Note that map entries are stored in insertion order, *not* sorted by key.
    public fun get_idx<K: copy>(self: &MultiMap<K>, key: &K): u64 {
        let idx_opt = get_idx_opt(self, key);
        assert!(option::is_some(&idx_opt), EKeyDoesNotExist);
        option::destroy_some(idx_opt)
    }

    /// Return a reference to the `idx`th entry of `self`. This gives direct access into the backing array of the map--use with caution.
    /// Note that map entries are stored in insertion order, *not* sorted by key.
    /// Aborts if `idx` is greater than or equal to `size(self)`
    public fun get_entry_by_idx<K: copy>(self: &MultiMap<K>, idx: u64): (&K, &u64) {
        assert!(idx < size(self), EIndexOutOfBounds);
        let entry = vector::borrow(&self.contents, idx);
        (&entry.key, &entry.priority)
    }

    /// Return a mutable reference to the `idx`th entry of `self`. This gives direct access into the backing array of the map--use with caution.
    /// Note that map entries are stored in insertion order, *not* sorted by key.
    /// Aborts if `idx` is greater than or equal to `size(self)`
    public fun get_entry_by_idx_mut<K: copy>(self: &mut MultiMap<K>, idx: u64): (&K, &mut u64) {
        assert!(idx < size(self), EIndexOutOfBounds);
        let entry = vector::borrow_mut(&mut self.contents, idx);
        (&entry.key, &mut entry.priority)
    }

    /// Remove the entry at index `idx` from self.
    /// Aborts if `idx` is greater than or equal to `size(self)`
    public fun remove_entry_by_idx<K: copy>(self: &mut MultiMap<K>, idx: u64): (K, u64) {
        assert!(idx < size(self), EIndexOutOfBounds);
        let Entry { key, priority } = vector::remove(&mut self.contents, idx);
        (key, priority)
    }

    #[test]
    fun test_insert() {
        let h = empty();

        insert(&mut h, 10, 10);
        check_max(&h, 10);

        insert(&mut h, 20, 20);
        check_max(&h, 20);

        insert(&mut h, 40, 40);
        check_max(&h, 40);

        insert(&mut h, 30, 30);
        check_max(&h, 40);

        std::debug::print(&h);

        check_pop_max(&mut h, 40);
        check_pop_max(&mut h, 30);
        check_pop_max(&mut h, 20);
        check_pop_max(&mut h, 10);

        std::debug::print(&h);
    }

    #[test]
    fun test_insert_many() {
        let h = empty();

        insert(&mut h, 126, 126);
        insert(&mut h, 207, 207);
        insert(&mut h, 157, 157);
        insert(&mut h, 216, 216);
        insert(&mut h, 188, 188);
        insert(&mut h, 219, 219);
        insert(&mut h, 217, 217);
        insert(&mut h, 249, 249);
        std::debug::print(&h);

        check_pop_max(&mut h, 249);
        check_pop_max(&mut h, 219);
        check_pop_max(&mut h, 217);

        std::debug::print(&h);
        check_pop_max(&mut h, 216);
    }

    #[test_only]
    fun check_pop_max(h: &mut MultiMap<u64>, expected_priority: u64) {
        let (_key, priority) = remove_entry_by_idx(h, 0);
        assert!(priority == expected_priority, 0);
    }

    #[test_only]
    fun check_max(h: &MultiMap<u64>, expected_priority: u64) {
        let (_key, priority) = get_entry_by_idx(h, 0);
        assert!(priority == &expected_priority, 0);
    }
}
