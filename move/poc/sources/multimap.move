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

    /// Trying to pop from a map that is empty
    const EMapEmpty: u64 = 4;

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
        vector::push_back(&mut self.contents, Entry { key, priority });

        let index = vector::length(&self.contents) - 1;
        restore_heap_recursive(&mut self.contents, index);
    }
    fun restore_heap_recursive<K: copy>(v: &mut vector<Entry<K>>, i: u64) {
        if (i == 0) {
            return
        };
        let parent = (i - 1) / 2;

        // If new elem is greater than its parent, swap them and recursively
        // do the restoration upwards.
        if (vector::borrow(v, i).priority > vector::borrow(v, parent).priority) {
            vector::swap(v, i, parent);
            restore_heap_recursive(v, parent);
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

}
