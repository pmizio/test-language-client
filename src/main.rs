mod test_module;
use test_module::test_fn;

fn main() {
    let test = "world";

    println!("Hello, {}!", test);
    test_fn();
}
